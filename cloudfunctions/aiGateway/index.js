// aiGateway：AI 提供方隔离与响应归一化（ADR-003）。
// 提供方特定协议（DeepSeek）只存在于本云函数内，绝不外泄到 UI。
// 返回稳定的应用层 ChatReply：{ id, content, riskLevel, createdAt }。
const https = require('https')
const cloud = require('wx-server-sdk')
const { buildMessages } = require('./prompt')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 服务端高危兜底：危机检测不依赖模型可用性，命中即让位安全协议（product-definition.md §6 high）。
const PAT_HIGH = /(不想活|活不下去|结束生命|自杀|轻生|不想醒来|撑不下去了|想死|了结自己|不想再撑|一了百了)/
const RISK = ['none', 'low', 'medium', 'high']

const reply = (content, riskLevel) => ({
  id: `r_${Date.now()}`,
  content,
  riskLevel,
  createdAt: Date.now()
})

// —— 内容安全（C1）：security.msgSecCheck 检违法违规，不是事实性纠错 ——
// 用户输入与 AI 输出各检一次。检测服务不可用时放行并记日志（内测期可用性优先，
// 策略见 cloudfunctions/README.md）；命中违规（errCode 87014 / suggest!==pass）则拦截。
const SEC_MAX_CHARS = 2500
const secPass = async (content, openid) => {
  if (!openid) {
    // 控制台测试等无 openid 上下文：msgSecCheck v2 必须带 openid，跳过并记录。
    console.warn('msgSecCheck skipped: no openid in context')
    return true
  }
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      openid,
      scene: 4,
      version: 2,
      content: String(content).slice(0, SEC_MAX_CHARS)
    })
    return !res || !res.result || res.result.suggest === 'pass'
  } catch (e) {
    if (e && (e.errCode === 87014 || e.errcode === 87014)) return false
    console.error('msgSecCheck unavailable, fail-open:', (e && (e.errMsg || e.message)) || e)
    return true
  }
}

// 拦截文案：不评判、不说教，保持陪伴人格（客户端不感知拦截，走正常 ChatReply）。
const INPUT_BLOCKED_REPLY =
  '这句话里有些内容，这里不适合展开。如果你想聊的是它带给你的感受，可以换个说法，我还在。'
const OUTPUT_FALLBACK = '嗯，我在。你愿意说，我就听着。'

const callDeepSeek = (apiKey, messages) =>
  new Promise((resolve, reject) => {
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
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      }
    )
    req.on('error', reject)
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

  // 2) 输入内容安全：违规则温和拦截，不调用模型。
  if (!(await secPass(message, OPENID))) return reply(INPUT_BLOCKED_REPLY, 'none')

  // 3) 正常路径：走 DeepSeek 生成陪伴内容 + 判级。
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { error: 'NO_KEY' }

  try {
    const resp = await callDeepSeek(apiKey, buildMessages(message))
    const raw =
      resp && resp.choices && resp.choices[0] && resp.choices[0].message
        ? resp.choices[0].message.content
        : ''
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (_) {
      parsed = { content: raw || '', riskLevel: 'none' }
    }
    const level = RISK.includes(parsed.riskLevel) ? parsed.riskLevel : 'none'
    const content =
      typeof parsed.content === 'string' && parsed.content.trim()
        ? parsed.content.trim()
        : OUTPUT_FALLBACK

    // 4) 输出内容安全：模型输出违规则替换为兜底陪伴语，风险级别保留。
    const safe = await secPass(content, OPENID)
    return reply(safe ? content : OUTPUT_FALLBACK, level)
  } catch (e) {
    return { error: 'PROVIDER' }
  }
}
