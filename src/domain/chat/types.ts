// 应用层聊天类型：UI 只消费这些稳定类型，绝不接触任何 AI 提供方原生字段。
export type RiskLevel = 'none' | 'low' | 'medium' | 'high'

export type ChatReply = {
  readonly id: string
  readonly content: string
  readonly riskLevel: RiskLevel
  readonly createdAt: number
}

export type SendMessageInput = {
  readonly content: string
  readonly anonymousId?: string
}

/** 网关请求（应用层），由基础设施适配器映射到具体提供方协议。 */
export type AiGatewayRequest = {
  readonly message: string
  readonly anonymousId?: string
}
