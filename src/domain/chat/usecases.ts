import { type Result, err } from '@/shared/result'
import { type AppError, appError, ErrorCode } from '@/shared/errors'
import type { AiGatewayPort } from './ports'
import type { ChatReply, SendMessageInput } from './types'

// 发送用例：输入校验 + 网关编排。不含任何提供方细节。
export const sendMessage = async (
  gateway: AiGatewayPort,
  input: SendMessageInput
): Promise<Result<ChatReply, AppError>> => {
  const content = input.content.trim()
  if (content.length === 0) {
    return err(appError(ErrorCode.EmptyInput, '还没写呢——一个词、半句话都可以。', false))
  }
  return gateway.send({ message: content, anonymousId: input.anonymousId })
}
