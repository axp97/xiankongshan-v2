import { BASE_TOKENS, PALETTES, type TimeOfDayKey } from './spec'

// weapp 渲染图标时需把 CSS 变量解析为具体色（<image> data-uri 烤色）。
// 值与 theme.scss 同源（spec.ts 沉淀），H5 仍走 CSS var()，不经此文件。

/** 时段无关品牌色镜像（var(--x) → 具体色） */
const BRAND_VAR: Record<string, string> = {
  'var(--sage)': BASE_TOKENS.sage,
  'var(--deep)': BASE_TOKENS.deep,
  'var(--notice)': BASE_TOKENS.notice
}

/** --foot-ink 随时段变化，按 tod 解析 */
export const footInkAt = (tod: TimeOfDayKey): string => PALETTES[tod].footInk

/** --placeholder 随时段变化，按 tod 解析（placeholderStyle 用） */
export const placeholderAt = (tod: TimeOfDayKey): string => PALETTES[tod].placeholder

/**
 * 解析图标色：hex/rgb 直通；品牌 var 查镜像；--foot-ink 需 tod。
 * 无法解析时返回 undefined（调用方回退 currentColor，仅 H5 有意义）。
 */
export const resolveIconColor = (color: string, tod?: TimeOfDayKey): string | undefined => {
  if (color.startsWith('#') || color.startsWith('rgb')) return color
  if (color in BRAND_VAR) return BRAND_VAR[color]
  if (color === 'var(--foot-ink)') return tod ? footInkAt(tod) : undefined
  return undefined
}
