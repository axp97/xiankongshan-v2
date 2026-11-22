// 应用层聊天类型：UI 只消费这些稳定类型，绝不接触任何 AI 提供方原生字段。
export const RISK_LEVELS = ['none', 'low', 'medium', 'high'] as const

export type RiskLevel = (typeof RISK_LEVELS)[number]

export const isRiskLevel = (value: unknown): value is RiskLevel =>
  typeof value === 'string' && (RISK_LEVELS as readonly string[]).includes(value)

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
