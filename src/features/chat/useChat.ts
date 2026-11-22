import { useEffect, useMemo, useRef, useState } from 'react'
import { TIMING } from '@/shared/constants'
import { type SessionMeta } from '@/domain/anti-dependency/types'
import { frequencyNoticeDue, openSession, startSession } from '@/domain/anti-dependency/antiDependency'
import { loadAntiDep, saveAntiDep } from '@/infra/storage/antiDependencyStore'
import { getAiGateway } from '@/infra/ai'
import { getAnonymousId } from '@/infra/auth/anonymous'
import { type FollowupKind, type StreamItem } from './messages'
import { createChatSession, type ChatSnapshot } from './chatSession'
import * as copy from './copy'

const prefersReduced =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const thinkWait = prefersReduced ? TIMING.thinkWaitReducedMs : TIMING.thinkWaitMs

type ChatApi = {
  items: readonly StreamItem[]
  riskActive: boolean
  companionFollowups: boolean
  frequencyNotice: string | null
  showOpening: boolean
  send: (text: string) => void
  followup: (kind: FollowupKind) => void
  retry: (itemId: string) => void
  clearSession: () => void
}

const openChatMeta = (): SessionMeta => {
  const now = new Date()
  const opened = openSession(loadAntiDep(), now)
  saveAntiDep(opened)
  return startSession(opened, now)
}

export const useChat = (): ChatApi => {
  const gateway = useMemo(() => getAiGateway(), [])
  const anonId = useRef<string | undefined>(undefined)
  // 只在 ref 为空时打开会话。放进 useRef(初值) 会在每次 render 求值并写 dayCount。
  const metaRef = useRef<SessionMeta | null>(null)
  if (metaRef.current === null) metaRef.current = openChatMeta()

  const sessionRef = useRef<ReturnType<typeof createChatSession> | null>(null)
  if (sessionRef.current === null) {
    sessionRef.current = createChatSession({
      gateway,
      meta: metaRef.current,
      getAnonymousId: () => anonId.current,
      thinkWaitMs: thinkWait,
      slowHintMs: TIMING.slowHintMs,
      saveMeta: saveAntiDep
    })
  }
  const session = sessionRef.current

  const [snap, setSnap] = useState<ChatSnapshot>(() => session.getSnapshot())
  const [frequencyNotice] = useState<string | null>(
    frequencyNoticeDue(metaRef.current) ? copy.FREQUENCY_NOTICE : null
  )

  useEffect(() => session.subscribe(setSnap), [session])

  useEffect(() => {
    void getAnonymousId().then((id) => {
      anonId.current = id
    })
  }, [])

  return {
    items: snap.items,
    riskActive: snap.riskActive,
    companionFollowups: snap.companionFollowups,
    frequencyNotice,
    showOpening: snap.items.length === 0,
    send: session.send,
    followup: session.followup,
    retry: session.retry,
    clearSession: session.clearSession
  }
}
