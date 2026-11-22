import { describe, expect, it } from 'vitest'
import { CONTENT_SAFETY } from '@/shared/constants'
import {
  SEC_MAX_UNITS,
  Screen,
  gateInput,
  interpretSecCheck,
  selectOutput
} from '../../../cloudfunctions/aiGateway/contentSafety.js'

describe('contentSafety', () => {
  it('客户端与云端使用同一个长度上限', () => {
    expect(SEC_MAX_UNITS).toBe(CONTENT_SAFETY.maxUnits)
  })

  it('无 openid、异常、缺 result 都是不可用；87014 和建议值非 pass 是拦截', () => {
    expect(interpretSecCheck({ openid: '' })).toBe(Screen.UNAVAILABLE)
    expect(interpretSecCheck({ openid: 'o', error: { errCode: 87014 } })).toBe(Screen.BLOCKED)
    expect(interpretSecCheck({ openid: 'o', error: { errCode: -1 } })).toBe(Screen.UNAVAILABLE)
    expect(interpretSecCheck({ openid: 'o', response: {} })).toBe(Screen.UNAVAILABLE)
    expect(interpretSecCheck({ openid: 'o', response: { result: { suggest: 'pass' } } })).toBe(Screen.PASS)
    expect(interpretSecCheck({ openid: 'o', response: { result: { suggest: 'risky' } } })).toBe(Screen.BLOCKED)
  })

  it('超限和不可用都不进入模型；只有 pass 才放行', () => {
    expect(gateInput({ tooLong: true, screen: Screen.PASS })).toEqual({ type: 'too_long' })
    expect(gateInput({ tooLong: false, screen: Screen.UNAVAILABLE })).toEqual({ type: 'unavailable' })
    expect(gateInput({ tooLong: false, screen: Screen.BLOCKED })).toEqual({ type: 'blocked' })
    expect(gateInput({ tooLong: false, screen: Screen.PASS })).toEqual({ type: 'proceed' })
  })

  it('输出只有完整通过才展示原文，否则整段换成兜底', () => {
    const fallback = '兜底'
    expect(selectOutput({ modelText: '原文', screen: Screen.PASS, fallback })).toBe('原文')
    expect(selectOutput({ modelText: '原文', screen: Screen.UNAVAILABLE, fallback })).toBe(fallback)
    expect(selectOutput({ modelText: '原文', screen: Screen.BLOCKED, fallback })).toBe(fallback)
    expect(selectOutput({ modelText: '', screen: Screen.PASS, fallback })).toBe(fallback)
    expect(
      selectOutput({ modelText: '啊'.repeat(SEC_MAX_UNITS + 1), screen: Screen.PASS, fallback })
    ).toBe(fallback)
  })
})
