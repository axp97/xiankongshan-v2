import { describe, expect, it } from 'vitest'
import { initialRiskState, nextRiskState } from './riskState'

// 客户端风险状态机护栏（product-definition.md §6）：
// high 让位安全协议；high 后非 high 必须经 transition 复位，禁止直接回 normal。
describe('nextRiskState', () => {
  it('high 命中：让位安全协议，进入 riskActive', () => {
    const { state, display } = nextRiskState(initialRiskState, 'high')
    expect(display).toBe('risk')
    expect(state.riskActive).toBe(true)
  })

  it('riskActive 期间再遇 high：仍展示风险卡，保持激活', () => {
    const { state, display } = nextRiskState({ riskActive: true }, 'high')
    expect(display).toBe('risk')
    expect(state.riskActive).toBe(true)
  })

  it('riskActive 期间非 high：经 transition 复位，不直接回 normal', () => {
    const { state, display } = nextRiskState({ riskActive: true }, 'low')
    expect(display).toBe('transition')
    expect(state.riskActive).toBe(false)
  })

  it('常态非 high：normal 展示，保持非激活', () => {
    for (const level of ['none', 'low', 'medium'] as const) {
      const { state, display } = nextRiskState(initialRiskState, level)
      expect(display).toBe('normal')
      expect(state.riskActive).toBe(false)
    }
  })
})
