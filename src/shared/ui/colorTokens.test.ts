import { describe, expect, it } from 'vitest'
import { resolveIconColor, footInkAt, placeholderAt } from './colorTokens'
import { BASE_TOKENS, PALETTES } from './spec'

describe('resolveIconColor', () => {
  it('hex / rgb 直通', () => {
    expect(resolveIconColor('#fff')).toBe('#fff')
    expect(resolveIconColor('#66756a')).toBe('#66756a')
    expect(resolveIconColor('rgba(0,0,0,0.5)')).toBe('rgba(0,0,0,0.5)')
  })

  it('品牌 var 查镜像（时段无关）', () => {
    expect(resolveIconColor('var(--sage)')).toBe(BASE_TOKENS.sage)
    expect(resolveIconColor('var(--deep)')).toBe(BASE_TOKENS.deep)
    expect(resolveIconColor('var(--notice)')).toBe(BASE_TOKENS.notice)
  })

  it('foot-ink 随时段解析', () => {
    expect(resolveIconColor('var(--foot-ink)', 'day')).toBe(PALETTES.day.footInk)
    expect(resolveIconColor('var(--foot-ink)', 'night')).toBe(PALETTES.night.footInk)
    expect(resolveIconColor('var(--foot-ink)', 'evening')).toBe(PALETTES.evening.footInk)
    expect(resolveIconColor('var(--foot-ink)')).toBeUndefined()
  })

  it('未知输入回退 undefined', () => {
    expect(resolveIconColor('var(--unknown)')).toBeUndefined()
    expect(resolveIconColor('currentColor')).toBeUndefined()
  })
})

describe('placeholderAt', () => {
  it('四时段 placeholder 色', () => {
    expect(placeholderAt('day')).toBe(PALETTES.day.placeholder)
    expect(placeholderAt('evening')).toBe(PALETTES.evening.placeholder)
    expect(placeholderAt('night')).toBe(PALETTES.night.placeholder)
    expect(placeholderAt('morning')).toBe(PALETTES.morning.placeholder)
  })
})

describe('footInkAt', () => {
  it('与 SPEC palette 同源', () => {
    for (const tod of ['morning', 'day', 'evening', 'night'] as const) {
      expect(footInkAt(tod)).toBe(PALETTES[tod].footInk)
    }
  })
})
