// 纯时间工具：时段判定与日期比较，供主题与反依赖复用。
import type { ThemeKey } from '@/shared/ui/spec'

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export const timeOfDayAt = (date: Date): TimeOfDay => {
  const h = date.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'day'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

/** 生产主题键：亮（day）/ 暗（night）。22:00–05:00 为暗，与契约 night 区间一致。 */
export const themeKeyAt = (date: Date): ThemeKey => {
  const h = date.getHours()
  return h >= 22 || h < 5 ? 'night' : 'day'
}

export const dateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

export const isYesterday = (key: string | null, now: Date): boolean => {
  if (!key) return false
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  return key === dateKey(y)
}

/** 导航栏色值（仅启用两套主题，供 Taro.setNavigationBarColor 使用） */
export const NAV_COLOR: Record<ThemeKey, { front: string; background: string }> = {
  day: { front: '#000000', background: '#F7FAF6' },
  night: { front: '#ffffff', background: '#10221B' }
}
