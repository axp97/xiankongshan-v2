import type { CSSProperties } from 'react'
import { View } from '@tarojs/components'
import { ICONS, type IconName } from './icons'

// 单色 monoline 图标（CSS mask + data-URI SVG）。
// mask 只取 alpha，颜色由 color 驱动：支持 var(--token)，随时段主题自动变化。
// 基础样式 .xk-icon 定义在 app.scss（weapp 组件级 scss 不做全局注入）。
type Props = {
  name: IconName
  size?: number
  color?: string
  className?: string
}

export const Icon = ({ name, size = 16, color = 'currentColor', className = '' }: Props) => {
  const url = `url("data:image/svg+xml,${encodeURIComponent(ICONS[name])}")`
  const style: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    WebkitMaskImage: url,
    maskImage: url
  }
  return <View className={`xk-icon ${className}`} style={style} />
}
