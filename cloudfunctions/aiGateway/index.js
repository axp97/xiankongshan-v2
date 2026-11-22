// aiGateway：AI 提供方隔离与响应归一化（ADR-003）。
// 提供方特定协议（DeepSeek）只存在于本云函数内，绝不外泄到 UI。
// 返回稳定的应用层 ChatReply：{ id, content, riskLevel, createdAt }。
const https = require('https')
const cloud = require('wx-server-sdk')
const { buildMessages } = require('./prompt')
const { ProviderCode, normalizeProviderHttp } = require('./providerReply')
const { SEC_MAX_UNITS, Screen, interpretSecCheck, gateInput, selectOutput } = require('./contentSafety')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 服务端高危兜底：危机检测不依赖模型可用性，命中即让位安全协议（product-definition.md §6 high）。
const PAT_HIGH = /(不想活|活不下去|结束生命|自杀|轻生|不想醒来|撑不下去了|想死|了结自己|不想再撑|一了百了)/

const reply = (content, riskLevel) => ({
  id: `r_${Date.now()}`,
  content,
  riskLevel,
  createdAt: Date.now()
})

// 内容安全三态：pass 才继续；blocked 用已审定文案；unavailable 不把未检测文本外发或展示。
const screenContent = async (content, openid) => {
  if (!openid) {
    console.warn('msgSecCheck unavailable: no openid')
    return interpretSecCheck({ openid: '' })
  }
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      openid,
      scene: 4,
      version: 2,
      content: String(content)
    })
    return interpretSecCheck({ openid, response: res })
  } catch (e) {
    const code = e && (e.errCode || e.errcode)
    console.error('msgSecCheck unavailable:', code || 'exception')
    return interpretSecCheck({ openid, error: e })
  }
}

// 拦截文案：不评判、不说教，保持陪伴人格（客户端不感知拦截，走正常 ChatReply）。
const INPUT_BLOCKED_REPLY =
  '这句话里有些内容，这里不适合展开。如果你想聊的是它带给你的感受，可以换个说法，我还在。'
const OUTPUT_FALLBACK = '嗯，我在。你愿意说，我就听着。'

const callDeepSeek = (apiKey, messages) =>
  new Promise((resolve, reject) => {
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const fail = (error) => {
      if (settled) return
      settled = true
      reject(error)
    }
    const payload = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })
    const req = https.request(
      {
        hostname: 'api.deepseek.com',
        path: '/chat/completions',
        method: 'POST',
        timeout: 25000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        const statusCode = res.statusCode || 0
        // 非 2xx 不读取正文，避免错误页被当成模型补全。
        if (statusCode < 200 || statusCode >= 300) {
          res.resume()
          finish(normalizeProviderHttp(statusCode, ''))
          return
        }
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('error', fail)
        res.on('end', () => finish(normalizeProviderHttp(statusCode, data)))
      }
    )
    req.on('error', fail)
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.write(payload)
    req.end()
  })

exports.main = async (event) => {
  const message = event && event.message ? String(event.message).trim() : ''
  if (!message) return { error: 'EMPTY' }

  const { OPENID } = cloud.getWXContext()

  // 1) 安全优先：高危关键词服务端兜底，直接让位安全协议，无需模型。
  //    先于内容安全——危机表达要进安全协议获得帮助，而不是被审核拦截。
  if (PAT_HIGH.test(message)) return reply('', 'high')

  // 2) 输入内容安全：超限或检测不可用都不调用模型；违规则温和拦截。
  const inputGate = gateInput({
    tooLong: message.length > SEC_MAX_UNITS,
    screen: message.length > SEC_MAX_UNITS ? Screen.UNAVAILABLE : await screenContent(message, OPENID)
  })
  if (inputGate.type === 'too_long') return { error: 'INPUT_TOO_LONG' }
  if (inputGate.type === 'unavailable') return { error: 'SEC_UNAVAILABLE' }
  if (inputGate.type === 'blocked') return reply(INPUT_BLOCKED_REPLY, 'none')

  // 3) 正常路径：走 DeepSeek 生成陪伴内容 + 判级。
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { error: 'NO_KEY' }

  try {
    const outcome = await callDeepSeek(apiKey, buildMessages(message))
    if (outcome.error) return { error: outcome.error }
    const modelText = outcome.content.trim()
    const outputScreen =
      modelText && modelText.length <= SEC_MAX_UNITS
        ? await screenContent(modelText, OPENID)
        : Screen.UNAVAILABLE
    const content = selectOutput({ modelText, screen: outputScreen, fallback: OUTPUT_FALLBACK })
    return reply(content, outcome.riskLevel)
  } catch (e) {
    console.error('aiGateway provider transport:', (e && e.message) || ProviderCode.UPSTREAM)
    return { error: ProviderCode.UPSTREAM }
  }
}
