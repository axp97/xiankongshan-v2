import { useEffect, useRef, useState } from 'react'
import { View, Text, Textarea, ScrollView, Button } from '@tarojs/components'
import type { BaseEventOrig, TextareaProps } from '@tarojs/components'
import { type StreamItem } from './messages'
import { useChat } from './useChat'
import { TrustSheet } from '@/features/privacy/TrustSheet'
import { Icon } from '@/shared/ui/Icon'
import { placeholderAt } from '@/shared/ui/colorTokens'
import type { ThemeKey } from '@/shared/ui/spec'
import * as copy from './copy'
import './ChatView.scss'

const paragraphs = (text: string) =>
  text.split('\n\n').map((block, i) => (
    <View className="para" key={i}>
      {block.split('\n').map((line, j) => (
        <Text className="line" key={j}>
          {line}
        </Text>
      ))}
    </View>
  ))

type Props = { seed?: string; tod: ThemeKey }

export const ChatView = ({ seed, tod }: Props) => {
  const chat = useChat()
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [scrollInto, setScrollInto] = useState('')
  const seededRef = useRef(false)

  // 首页带入的一句直接发送（一次性）。
  useEffect(() => {
    if (seed && !seededRef.current) {
      seededRef.current = true
      chat.send(seed)
    }
  }, [seed, chat])

  useEffect(() => {
    if (chat.items.length > 0) setScrollInto('stream-bottom')
  }, [chat.items])

  const onInput = (e: BaseEventOrig<TextareaProps.onInputEventDetail>) => {
    setText(e.detail.value)
    if (nudge) setNudge(false)
  }

  const submit = () => {
    if (!text.trim()) {
      setNudge(true)
      setTimeout(() => setNudge(false), 2600)
      return
    }
    chat.send(text)
    setText('')
  }

  const clearAll = () => {
    chat.clearSession()
    setConfirmOpen(false)
  }

  return (
    <View className={`chat ${chat.riskActive ? 'risk-active' : ''}`}>
      <ScrollView className="stream" scrollY scrollIntoView={scrollInto} scrollWithAnimation>
        <View className="stream-inner">
          {chat.showOpening && (
            <View className="opening">
              <View className="kicker">
                <View className="dot" />
                <Text>{copy.OPENING.kicker}</Text>
              </View>
              <Text className="op-line">{copy.OPENING.line}</Text>
              <Text className="op-sub">{copy.OPENING.sub}</Text>
              {chat.frequencyNotice && <Text className="op-freq">{chat.frequencyNotice}</Text>}
            </View>
          )}

          {chat.items.map((it) => (
            <StreamRow key={it.id} item={it} onFollowup={chat.followup} onRetry={chat.retry} />
          ))}

          <View id="stream-bottom" className="stream-anchor" />
        </View>
      </ScrollView>

      <View className="dock">
        <View className="dock-wrap">
          <View className={`nudge ${nudge ? 'show' : ''}`}>{copy.COMPOSER.nudge}</View>
          <View className="secondary-row">
            <View className="hint-treehole">
              <Icon name="treehole" size={14} color="var(--sage)" />
              <Text>以后也可以把心事放进树洞</Text>
            </View>
            <View className="privacy-entry" onClick={() => setSheetOpen(true)}>
              <Icon name="shieldCheck" size={13} color="var(--foot-ink)" tod={tod} />
              <Text>隐私与边界</Text>
            </View>
          </View>
          <View className={`composer ${focused ? 'focused' : ''}`}>
            <Textarea
              className="input"
              value={text}
              placeholder={copy.COMPOSER.placeholder}
              placeholderStyle={`color: ${placeholderAt(tod)}`}
              autoHeight
              maxlength={-1}
              adjustPosition
              onInput={onInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Button className="send" disabled={!text.trim()} onClick={submit}>
              <Icon name="send" size={20} color="#fff" />
            </Button>
          </View>
        </View>
      </View>

      {sheetOpen && (
        <TrustSheet
          onClose={() => setSheetOpen(false)}
          onClear={() => {
            setSheetOpen(false)
            setConfirmOpen(true)
          }}
        />
      )}

      {confirmOpen && <ClearConfirm onCancel={() => setConfirmOpen(false)} onOk={clearAll} />}
    </View>
  )
}

const StreamRow = ({
  item,
  onFollowup,
  onRetry
}: {
  item: StreamItem
  onFollowup: ReturnType<typeof useChat>['followup']
  onRetry: () => void
}) => {
  switch (item.kind) {
    case 'user':
      return (
        <View className="msg user">
          <View className="bubble">
            <Text>{item.text}</Text>
          </View>
          <Text className="meta">刚刚</Text>
        </View>
      )
    case 'ai':
      return (
        <View className="msg ai">
          <View className="bubble">{paragraphs(item.text)}</View>
          {item.followups && (
            <View className="followups">
              <View className="chip" hoverClass="pressed" onClick={() => onFollowup('more')}>
                <Icon name="plus" size={13} color="var(--sage)" />
                <Text>继续聊</Text>
              </View>
              <View className="chip" hoverClass="pressed" onClick={() => onFollowup('angle')}>
                <Icon name="rotate" size={13} color="var(--sage)" />
                <Text>换个角度</Text>
              </View>
              <View className="chip calm" hoverClass="pressed" onClick={() => onFollowup('better')}>
                我现在好一点了
              </View>
            </View>
          )}
          <AiMeta />
        </View>
      )
    case 'transition':
      return (
        <View className="msg ai">
          <View className="bubble">{paragraphs(item.text)}</View>
          <AiMeta />
        </View>
      )
    case 'thinking':
      return (
        <View className="thinking">
          <View className="think-row">
            <View className="think-dots">
              <View className="d" />
              <View className="d" />
              <View className="d" />
            </View>
            <Text className="think-label">{copy.THINK_LABEL}</Text>
          </View>
          {item.slow && (
            <View className="slow-hint">
              <Icon name="clock" size={15} color="var(--notice)" className="sh-ic" />
              <Text>{copy.SLOW_HINT}</Text>
              <Text className="retry" onClick={onRetry}>
                重试
              </Text>
            </View>
          )}
        </View>
      )
    case 'risk':
      return (
        <View className="risk">
          <View className="rk-head">
            <Icon name="riskShield" size={19} color="var(--notice)" />
            <Text className="rk-t">{item.title}</Text>
          </View>
          <Text className="rk-body">
            {copy.RISK_BODY.lead}
            <Text className="rk-emph">{copy.RISK_BODY.emph}</Text>
            {copy.RISK_BODY.trail}
          </Text>
          <View className="rk-actions">
            <View className="rk-btn primary" onClick={() => onFollowup('reach')}>
              联系一个我信任的人
            </View>
            <View className="rk-btn ghost" onClick={() => onFollowup('stay')}>
              我先待一会儿
            </View>
          </View>
          <Text className="rk-note">{copy.RISK_NOTE}</Text>
        </View>
      )
    case 'error':
      return (
        <View className="errorbar">
          <Icon name="warnTriangle" size={20} color="var(--notice)" className="eb-ic" />
          <View className="eb-body">
            <Text className="eb-title">{copy.ERROR_COPY.title}</Text>
            <Text className="eb-sub">{copy.ERROR_COPY.sub}</Text>
          </View>
          <View className="eb-retry" onClick={onRetry}>
            重试
          </View>
        </View>
      )
    default:
      return null
  }
}

// AI 气泡 meta：sage-wash 圆底 + 深绿叶子标记（设计契约 .msg.ai .meta .mk）
const AiMeta = () => (
  <View className="meta ai-meta">
    <View className="mk">
      <Icon name="leaf" size={9} color="var(--deep)" />
    </View>
    <Text>陪你整理的回应</Text>
  </View>
)

const ClearConfirm = ({ onCancel, onOk }: { onCancel: () => void; onOk: () => void }) => (
  <View className="confirm show">
    <View className="cf-scrim" onClick={onCancel} />
    <View className="cf-card">
      <Text className="cf-t">{copy.CLEAR_CONFIRM.title}</Text>
      <Text className="cf-d">{copy.CLEAR_CONFIRM.desc}</Text>
      <View className="cf-actions">
        <View className="cf-cancel" onClick={onCancel}>
          {copy.CLEAR_CONFIRM.cancel}
        </View>
        <View className="cf-ok" onClick={onOk}>
          {copy.CLEAR_CONFIRM.ok}
        </View>
      </View>
    </View>
  </View>
)
