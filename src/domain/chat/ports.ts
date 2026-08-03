import type { Result } from '@/shared/result'
import type { AppError } from '@/shared/errors'
import type { AiGatewayRequest, ChatReply } from './types'

// 依赖倒置：领域定义网关端口，基础设施提供实现（stub / cloud）。
export interface AiGatewayPort {
  send(request: AiGatewayRequest): Promise<Result<ChatReply, AppError>>
}
