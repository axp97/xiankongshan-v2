import { View, Text } from '@tarojs/components'
import { TRUST } from './copy'
import { Icon } from '@/shared/ui/Icon'
import './TrustSheet.scss'

// 底部信任 sheet，首页 / 会话页共用。onClear 存在时展示“清除本次内容”。
type Props = {
  onClose: () => void
  onClear?: () => void
}

export const TrustSheet = ({ onClose, onClear }: Props) => (
  <>
    <View className="scrim show" onClick={onClose} />
    <View className="sheet show">
      <View className="grab" />
      <Text className="sh-title">{TRUST.title}</Text>
      <Text className="sh-sub">{TRUST.sub}</Text>
      <View className="trust-list">
        {TRUST.items.map((it) => (
          <View className="trust-item" key={it.t}>
            <View className="ti-ic">
              <Icon name={it.icon} size={17} color="var(--deep)" />
            </View>
            <View className="ti-body">
              <Text className="ti-t">{it.t}</Text>
              <Text className="ti-d">{it.d}</Text>
            </View>
          </View>
        ))}
      </View>
      <View className="sh-foot">
        {onClear && (
          <View className="sh-clear" onClick={onClear}>
            <Icon name="trash" size={15} color="#66756a" />
            <Text>{TRUST.clear}</Text>
          </View>
        )}
        <View className="sh-done" onClick={onClose}>
          {TRUST.done}
        </View>
      </View>
    </View>
  </>
)
