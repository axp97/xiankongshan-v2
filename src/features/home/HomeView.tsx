import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea, Button } from '@tarojs/components'
import type { BaseEventOrig, TextareaProps } from '@tarojs/components'
import { TrustSheet } from '@/features/privacy/TrustSheet'
import { Icon } from '@/shared/ui/Icon'
import { placeholderAt } from '@/shared/ui/colorTokens'
import type { IconName } from '@/shared/ui/icons'
import type { ThemeKey } from '@/shared/ui/spec'
import './HomeView.scss'

// 起头词：图标名取自设计契约 home.html .starter .si
const STARTERS: Array<{ seed: string; label: string; icon: IconName }> = [
  { seed: '今天有点累，说不上为什么。', label: '今天有点累', icon: 'spark' },
  { seed: '又到深夜了，还是睡不着。', label: '睡不着', icon: 'moon' },
  { seed: '今天发生了一件让我很委屈的事。', label: '有点委屈', icon: 'frown' },
  { seed: '我也不知道想说什么，就是有点闷。', label: '不想说话', icon: 'lines' }
]

export const HomeView = ({ tod }: { tod: ThemeKey }) => {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const onInput = (e: BaseEventOrig<TextareaProps.onInputEventDetail>) => setText(e.detail.value)

  const appendSeed = (seed: string) =>
    setText((prev) => (prev.trim() ? `${prev.trim()} ${seed}` : seed))

  const go = () => {
    const t = text.trim()
    if (!t) return
    Taro.navigateTo({ url: `/pages/chat/index?seed=${encodeURIComponent(t)}` })
  }

  return (
    <View className="home">
      <View className="greet">
        <View className="anon">
          <View className="ad" />
          <Text>匿名 · 这里只你一个人</Text>
        </View>
        <Text className="title">慢慢说，我在这里。</Text>
        <Text className="sub">先把这一句放下来。不必完整，不必体面。</Text>
      </View>

      <View className={`speak ${focused ? 'focused' : ''}`}>
        <Textarea
          className="say"
          value={text}
          placeholder="写下一句现在最想说的话…"
          placeholderStyle={`color: ${placeholderAt(tod)}`}
          autoHeight
          maxlength={-1}
          onInput={onInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <View className="speak-foot">
          <Text className="count">{text.trim().length}</Text>
          <Button className="send" disabled={!text.trim()} onClick={go}>
            放下这一句
            <Icon name="sendHome" size={17} color="#fff" className="send-ic" />
          </Button>
        </View>
      </View>

      <View className="starters">
        <Text className="st-label">不知从哪说起？从这里起个头：</Text>
        <View className="st-grid">
          {STARTERS.map((st) => (
            <View
              className="starter"
              key={st.seed}
              hoverClass="pressed"
              onClick={() => appendSeed(st.seed)}
            >
              <Icon name={st.icon} size={15} color="var(--sage)" className="si" />
              {st.label}
            </View>
          ))}
        </View>
      </View>

      <View className="home-foot">
        <View className="treehole-hint">
          <Icon name="treehole" size={16} color="var(--sage)" className="ti" />
          以后也可以把心事放进树洞，不急着看。
        </View>
        <View className="privacy-row">
          <View className="privacy-entry" onClick={() => setSheetOpen(true)}>
            <Icon name="shieldCheck" size={13} color="var(--foot-ink)" tod={tod} />
            <Text>隐私与边界</Text>
          </View>
        </View>
      </View>

      {sheetOpen && <TrustSheet onClose={() => setSheetOpen(false)} />}
    </View>
  )
}
