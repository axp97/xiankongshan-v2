import type { CSSProperties } from 'react'
import { View, Image } from '@tarojs/components'
import { ICONS, type IconName } from './icons'
import { resolveIconColor } from './colorTokens'
import type { TimeOfDayKey } from './spec'

// 单色 monoline 图标。双端渲染：
// - H5：CSS mask 取形、backgroundColor 取色（支持 var(--token) 动态色）。
// - weapp：WXSS 不支持 mask-image（真机裸成实心方块），改 <image> + 烤色 data-uri。
// 基础样式 .xk-icon 定义在 app.scss。
type Props = {
  name: IconName
  size?: number
  color?: string
  /** 时段：weapp 下 color 为 var(--foot-ink) 时必需（烤色解析） */
  tod?: TimeOfDayKey
  className?: string
}

export const Icon = ({ name, size = 16, color = 'currentColor', tod, className = '' }: Props) => {
  if (process.env.TARO_ENV === 'weapp') {
    const resolved = resolveIconColor(color, tod) ?? '#000'
    const svg = ICONS[name].split('#000').join(resolved)
    const src = `data:image/svg+xml,${encodeURIComponent(svg)}`
    return (
      <Image
        className={`xk-icon ${className}`}
        src={src}
        mode="aspectFit"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    )
  }
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
