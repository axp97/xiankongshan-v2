import Taro from '@tarojs/taro'
import { type Result, ok, err } from '@/shared/result'
import { type AppError, appError, ErrorCode } from '@/shared/errors'
import type { AiGatewayPort } from '@/domain/chat/ports'
import type { AiGatewayRequest, ChatReply, RiskLevel } from '@/domain/chat/types'

// 微信云 BFF 适配器：唯一允许触达 aiGateway 云函数的出口（ADR-003）。
const RISK: readonly RiskLevel[] = ['none', 'low', 'medium', 'high']

const toReply = (raw: unknown): ChatReply | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const level = RISK.includes(r.riskLevel as RiskLevel) ? (r.riskLevel as RiskLevel) : 'none'
  if (typeof r.content !== 'string') return null
  return {
    id: typeof r.id === 'string' ? r.id : `reply_${Date.now()}`,
    content: r.content,
    riskLevel: level,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now()
  }
}

export const createCloudGateway = (): AiGatewayPort => ({
  async send(request: AiGatewayRequest): Promise<Result<ChatReply, AppError>> {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'aiGateway',
        data: { message: request.message, anonymousId: request.anonymousId }
      })
      const reply = toReply(res.result)
      if (!reply) {
        return err(appError(ErrorCode.Gateway, '回应格式异常，请稍后再试。', true))
      }
      return ok(reply)
    } catch {
      return err(appError(ErrorCode.Network, '网络好像断了一下。你的输入还在，可以再试一次。', true))
    }
  }
})
