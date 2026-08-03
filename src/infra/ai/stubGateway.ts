import { type Result, ok, err } from '@/shared/result'
import { type AppError, appError, ErrorCode } from '@/shared/errors'
import type { AiGatewayPort } from '@/domain/chat/ports'
import type { AiGatewayRequest, ChatReply, RiskLevel } from '@/domain/chat/types'
import { REPLIES_NORMAL, REPLIES_MEDIUM } from './replies'

// 本地 / H5 桩网关：承载 riskLevel 判定与归一化，UI 永不持有触发词表。
// 生产态由 cloudGateway 走 aiGateway 云函数替换本实现（工厂按 TARO_ENV 选择）。
const PAT_HIGH = /(不想活|活不下去|结束生命|自杀|轻生|不想醒来|撑不下去了|想死)/
const PAT_MEDIUM = /(一个人扛|没人能说|太孤独了|撑不住|谁也|没人懂)/
const PAT_LOW = /(有点累|有点闷|不开心|烦躁|委屈)/

const classify = (text: string): RiskLevel => {
  if (PAT_HIGH.test(text)) return 'high'
  if (PAT_MEDIUM.test(text)) return 'medium'
  if (PAT_LOW.test(text)) return 'low'
  return 'none'
}

const pick = (list: readonly string[]): string =>
  list[Math.floor(Math.random() * list.length)]

const contentFor = (level: RiskLevel): string => {
  // high / transition 的展示文案由客户端安全协议接管，此处 content 不会被渲染。
  if (level === 'medium') return pick(REPLIES_MEDIUM)
  return pick(REPLIES_NORMAL)
}

export const createStubGateway = (): AiGatewayPort => ({
  async send(request: AiGatewayRequest): Promise<Result<ChatReply, AppError>> {
    // 开发期可复现网络错误态：输入 "ERR" 触发。
    if (request.message.trim() === 'ERR') {
      const e: AppError = appError(ErrorCode.Network, '这条没能发出去', true)
      return err(e)
    }
    const level = classify(request.message)
    const reply: ChatReply = {
      id: `stub_${Date.now()}`,
      content: contentFor(level),
      riskLevel: level,
      createdAt: Date.now()
    }
    return ok(reply)
  }
})
