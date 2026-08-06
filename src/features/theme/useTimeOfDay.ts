import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { themeKeyAt, NAV_COLOR } from '@/shared/time'
import type { ThemeKey } from '@/shared/ui/spec'

// 按真实时间套用启用主题（亮/暗两套）：返回页面根 class 与主题键，并同步导航栏配色。
// 契约原四套中 morning≡day、evening 差异微弱——专家裁决收敛两套（spec.ts ACTIVE_THEMES）。
export const useTimeOfDay = (): { className: string; tod: ThemeKey } => {
  const [tod] = useState(() => themeKeyAt(new Date()))
  useEffect(() => {
    const c = NAV_COLOR[tod]
    try {
      Taro.setNavigationBarColor({ frontColor: c.front, backgroundColor: c.background })
    } catch {
      /* H5 或不支持时静默 */
    }
  }, [tod])
  return { className: `tod-${tod}`, tod }
}
