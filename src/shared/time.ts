// 纯时间工具：时段判定与日期比较，供主题与反依赖复用。
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export const timeOfDayAt = (date: Date): TimeOfDay => {
  const h = date.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'day'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

export const dateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

export const isYesterday = (key: string | null, now: Date): boolean => {
  if (!key) return false
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  return key === dateKey(y)
}

/** 导航栏色值（仅时段相关的两色，供 Taro.setNavigationBarColor 使用） */
export const NAV_COLOR: Record<TimeOfDay, { front: string; background: string }> = {
  morning: { front: '#000000', background: '#F7FAF6' },
  day: { front: '#000000', background: '#F7FAF6' },
  evening: { front: '#000000', background: '#EEF2EC' },
  night: { front: '#ffffff', background: '#10221B' }
}
