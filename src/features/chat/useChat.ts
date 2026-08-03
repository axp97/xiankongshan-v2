import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TIMING } from '@/shared/constants'
import { sendMessage } from '@/domain/chat/usecases'
import { nextRiskState } from '@/domain/chat/riskState'
import { type RiskLevel } from '@/domain/chat/types'
import { type SessionMeta } from '@/domain/anti-dependency/types'
import {
  startSession,
  openSession,
  frequencyNoticeDue,
  crossDayCareDue,
  graceDue
} from '@/domain/anti-dependency/antiDependency'
import { loadAntiDep, saveAntiDep } from '@/infra/storage/antiDependencyStore'
import { getAiGateway } from '@/infra/ai'
import { getAnonymousId } from '@/infra/auth/anonymous'
import { type StreamItem, type FollowupKind } from './messages'
import * as copy from './copy'

const prefersReduced =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const thinkWait = prefersReduced ? TIMING.thinkWaitReducedMs : TIMING.thinkWaitMs

type ChatApi = {
  items: StreamItem[]
  riskActive: boolean
  frequencyNotice: string | null
  showOpening: boolean
  send: (text: string) => void
  followup: (kind: FollowupKind) => void
  retry: () => void
  clearSession: () => void
}

export const useChat = (): ChatApi => {
  const gateway = useMemo(() => getAiGateway(), [])

  // 反依赖会话态：可变引用，不直接驱动渲染（riskActive 另用 state 镜像）。
  const metaRef = useRef<SessionMeta>(
    (() => {
      const now = new Date()
      const opened = openSession(loadAntiDep(), now)
      saveAntiDep(opened)
      return startSession(opened, now)
    })()
  )
  const highCount = useRef(0)
  const seq = useRef(0)
  const lastUserText = useRef('')
  const anonId = useRef<string | undefined>(undefined)
  const nextId = () => `m${seq.current++}`

  useEffect(() => {
    void getAnonymousId().then((id) => {
      anonId.current = id
    })
  }, [])

  const [items, setItems] = useState<StreamItem[]>([])
  const [riskActive, setRiskActive] = useState(false)
  const [frequencyNotice] = useState<string | null>(
    frequencyNoticeDue(metaRef.current) ? copy.FREQUENCY_NOTICE : null
  )
  const showOpening = items.length === 0

  const push = (item: StreamItem) => setItems((prev) => [...prev, item])
  const removeById = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id))

  const applyReply = useCallback((content: string, riskLevel: RiskLevel, userText: string) => {
    const { state, display } = nextRiskState({ riskActive: metaRef.current.riskActive }, riskLevel)
    metaRef.current.riskActive = state.riskActive
    setRiskActive(state.riskActive)

    if (display === 'risk') {
      metaRef.current.transitionThisSession = false
      highCount.current += 1
      push({ kind: 'risk', id: nextId(), title: copy.riskTitle(highCount.current) })
      return
    }
    if (display === 'transition') {
      metaRef.current.transitionThisSession = true
      push({ kind: 'transition', id: nextId(), text: copy.TRANSITION_REPLY })
      return
    }
    // normal：先判反依赖层一善终，再判层三跨日前置
    if (graceDue(metaRef.current, userText, new Date())) {
      metaRef.current.graceShown = true
      push({ kind: 'ai', id: nextId(), text: copy.GRACE_REPLY, followups: false })
      return
    }
    let prefix = ''
    if (crossDayCareDue(metaRef.current)) {
      prefix = copy.CROSSDAY_PREFIX + '\n\n'
      metaRef.current.crossDayCareShown = true
      saveAntiDep(metaRef.current)
    }
    push({ kind: 'ai', id: nextId(), text: prefix + content, followups: true })
  }, [])

  const runReply = useCallback(
    async (text: string) => {
      const thinkingId = nextId()
      push({ kind: 'thinking', id: thinkingId, slow: false })
      const slowTimer = setTimeout(() => {
        setItems((prev) =>
          prev.map((it) => (it.id === thinkingId && it.kind === 'thinking' ? { ...it, slow: true } : it))
        )
      }, TIMING.slowHintMs)

      const [res] = await Promise.all([
        sendMessage(gateway, { content: text, anonymousId: anonId.current }),
        delay(thinkWait)
      ])
      clearTimeout(slowTimer)
      removeById(thinkingId)

      if (!res.ok) {
        push({ kind: 'error', id: nextId() })
        return
      }
      applyReply(res.value.content, res.value.riskLevel, text)
    },
    [gateway, applyReply]
  )

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      metaRef.current.graceShown = false
      lastUserText.current = trimmed
      push({ kind: 'user', id: nextId(), text: trimmed })
      void runReply(trimmed)
    },
    [runReply]
  )

  const retry = useCallback(() => {
    setItems((prev) => prev.filter((it) => it.kind !== 'error'))
    if (lastUserText.current) void runReply(lastUserText.current)
  }, [runReply])

  const followup = useCallback(
    (kind: FollowupKind) => {
      if (kind === 'more' || kind === 'angle') {
        void (async () => {
          const thinkingId = nextId()
          push({ kind: 'thinking', id: thinkingId, slow: false })
          await delay(thinkWait)
          removeById(thinkingId)
          push({ kind: 'ai', id: nextId(), text: copy.FOLLOWUP_REPLY[kind], followups: false })
        })()
        return
      }
      if (kind === 'better') {
        const tail = metaRef.current.riskActive ? '' : copy.FOLLOWUP_REPLY.betterTail
        push({ kind: 'ai', id: nextId(), text: copy.FOLLOWUP_REPLY.better + tail, followups: false })
        return
      }
      push({ kind: 'ai', id: nextId(), text: copy.FOLLOWUP_REPLY[kind], followups: false })
    },
    []
  )

  const clearSession = useCallback(() => {
    setItems([])
    setRiskActive(false)
    metaRef.current.riskActive = false
    highCount.current = 0
  }, [])

  return { items, riskActive, frequencyNotice, showOpening, send, followup, retry, clearSession }
}
