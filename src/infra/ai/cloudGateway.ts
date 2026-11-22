import Taro from '@tarojs/taro'
import { type Result, ok, err } from '@/shared/result'
import { type AppError, appError, ErrorCode, UserMessage } from '@/shared/errors'
import type { AiGatewayPort } from '@/domain/chat/ports'
import type { AiGatewayRequest, ChatReply } from '@/domain/chat/types'
import { parseChatReply } from './chatReply'
import { ensureCloud } from '@/infra/cloud/ensureCloud'

// 微信云 BFF 适配器：唯一允许触达 aiGateway 云函数的出口（ADR-003）。
const replyError = (code: unknown): AppError => {
  if (code === 'INPUT_TOO_LONG') return appError(ErrorCode.InputTooLong, UserMessage.inputTooLong, false)
  if (code === 'SEC_UNAVAILABLE') return appError(ErrorCode.Gateway, UserMessage.secUnavailable, true)
  return appError(ErrorCode.Gateway, '回应格式异常，请稍后再试。', true)
}

const callFailureDetail = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error !== null && 'errMsg' in error) {
    const msg = (error as { errMsg?: unknown }).errMsg
    if (typeof msg === 'string' && msg.length > 0) return msg
  }
  return 'CALL_FAILED'
}

export const createCloudGateway = (): AiGatewayPort => ({
  async send(request: AiGatewayRequest): Promise<Result<ChatReply, AppError>> {
    try {
      ensureCloud()
      const res = await Taro.cloud.callFunction({
        name: 'aiGateway',
        data: { message: request.message, anonymousId: request.anonymousId }
      })
      const reply = parseChatReply(res.result)
      if (!reply) {
        // 只记稳定错误码。不打印 result，避免错误体把原文带回控制台。
        const code = (res.result as { error?: unknown } | undefined)?.error
        console.error('[aiGateway] 回应不可归一化:', typeof code === 'string' ? code : 'UNKNOWN_SHAPE')
        return err(replyError(code))
      }
      return ok(reply)
    } catch (e) {
      // 真机排障：未部署 / 环境不匹配 / 网络断落在这里。只记 errMsg，不记整个异常对象。
      console.error('[aiGateway] callFunction 失败:', callFailureDetail(e))
      return err(appError(ErrorCode.Network, '网络好像断了一下。你的输入还在，可以再试一次。', true))
    }
  }
})
