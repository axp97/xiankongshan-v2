import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { timeOfDayAt, NAV_COLOR } from '@/shared/time'

// 按真实时间套用时段：返回页面根 class，并同步导航栏配色。无手动切换器（产品页）。
export const useTimeOfDay = (): string => {
  const [tod] = useState(() => timeOfDayAt(new Date()))
  useEffect(() => {
    const c = NAV_COLOR[tod]
    try {
      Taro.setNavigationBarColor({ frontColor: c.front, backgroundColor: c.background })
    } catch {
      /* H5 或不支持时静默 */
    }
  }, [tod])
  return `tod-${tod}`
}
