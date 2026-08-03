import type { RiskLevel } from './types'

// 会话流的展示动作：由 riskLevel + 会话危机态推导。
export type RiskDisplay = 'normal' | 'risk' | 'transition'

export type RiskState = { readonly riskActive: boolean }

// 客户端风险状态机（product-definition.md §6）：
//   —— high 由 aiGateway 判定；客户端只负责“让位 / 复位”的展示门控。
//   —— none/low/medium ⇄ high；high 后非 high 输入必须经 transition 复位，禁止直接回 medium/low。
export const nextRiskState = (
  prev: RiskState,
  incoming: RiskLevel
): { state: RiskState; display: RiskDisplay } => {
  if (incoming === 'high') {
    return { state: { riskActive: true }, display: 'risk' }
  }
  if (prev.riskActive) {
    return { state: { riskActive: false }, display: 'transition' }
  }
  return { state: { riskActive: false }, display: 'normal' }
}

export const initialRiskState: RiskState = { riskActive: false }
