import { TIMING } from '@/shared/constants'
import { sendMessage } from '@/domain/chat/usecases'
import { nextRiskState } from '@/domain/chat/riskState'
import type { AiGatewayPort } from '@/domain/chat/ports'
import type { RiskLevel } from '@/domain/chat/types'
import type { SessionMeta } from '@/domain/anti-dependency/types'
import { crossDayCareDue, graceDue } from '@/domain/anti-dependency/antiDependency'
import { type FollowupKind, type StreamItem } from './messages'
import * as copy from './copy'

// 请求代次：响应按发送序落地。更晚的请求一旦提交，更早的在途结果不得改风险态、不得再写入。
// 慢重试作废原请求；清除抬高会话代次，旧网络 / followup / timer 都不能写回。

type Inflight = {
  requestId: string
  seq: number
  epoch: number
  text: string
  thinkingId: string
  slowTimer: ReturnType<typeof setTimeout> | null
}

export type ChatSnapshot = {
  readonly items: readonly StreamItem[]
  readonly riskActive: boolean
  /** 普通陪聊 chip。high 与本会话过渡期关闭，安全卡动作不走这里。 */
  readonly companionFollowups: boolean
}

export type ChatSession = {
  send: (text: string) => void
  retry: (itemId: string) => void
  followup: (kind: FollowupKind) => void
  clearSession: () => void
  getSnapshot: () => ChatSnapshot
  subscribe: (listener: (snapshot: ChatSnapshot) => void) => () => void
}

export type ChatSessionOptions = {
  gateway: AiGatewayPort
  meta: SessionMeta
  getAnonymousId?: () => string | undefined
  now?: () => Date
  thinkWaitMs?: number
  slowHintMs?: number
  saveMeta?: (meta: SessionMeta) => void
}

export const createChatSession = (options: ChatSessionOptions): ChatSession => {
  const now = options.now ?? (() => new Date())
  const thinkWaitMs = options.thinkWaitMs ?? TIMING.thinkWaitMs
  const slowHintMs = options.slowHintMs ?? TIMING.slowHintMs
  const meta = options.meta

  let items: StreamItem[] = []
  let epoch = 0
  let seq = 0
  let itemSeq = 0
  let committedSeq = 0
  let highCount = 0
  const voided = new Set<string>()
  const live = new Map<string, Inflight>()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const followupTimers = new Set<ReturnType<typeof setTimeout>>()
  const listeners = new Set<(snapshot: ChatSnapshot) => void>()

  const companionBlocked = () => meta.riskActive || meta.transitionThisSession

  const snapshot = (): ChatSnapshot => ({
    items,
    riskActive: meta.riskActive,
    companionFollowups: !companionBlocked()
  })
  const emit = () => {
    const next = snapshot()
    listeners.forEach((listener) => listener(next))
  }
  const nextItemId = () => `m${itemSeq++}`

  const removeIds = (ids: Set<string>) => {
    if (ids.size === 0) return
    const next = items.filter((it) => !ids.has(it.id))
    if (next.length === items.length) return
    items = next
    emit()
  }

  const push = (item: StreamItem) => {
    items = [...items, item]
    emit()
  }

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        resolve()
      }, ms)
      timers.add(timer)
    })

  const clearFollowupTimers = () => {
    for (const timer of followupTimers) clearTimeout(timer)
    followupTimers.clear()
  }

  const dropCompanionFollowups = () => {
    clearFollowupTimers()
    const stale = new Set(
      items.filter((it) => it.kind === 'thinking' && it.requestId === undefined).map((it) => it.id)
    )
    removeIds(stale)
  }

  const clearTimers = () => {
    for (const rec of live.values()) {
      if (rec.slowTimer) clearTimeout(rec.slowTimer)
    }
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
    clearFollowupTimers()
  }

  const canCommit = (rec: Inflight): boolean =>
    rec.epoch === epoch && !voided.has(rec.requestId) && live.has(rec.requestId) && rec.seq >= committedSeq

  const begin = (text: string): Inflight => {
    seq += 1
    const rec: Inflight = {
      requestId: `q${seq}`,
      seq,
      epoch,
      text,
      thinkingId: '',
      slowTimer: null
    }
    live.set(rec.requestId, rec)
    return rec
  }

  // 提交成功后抬高水位，并立刻拿掉更早请求的思考态。那些请求返回时不得再落地。
  const takeCommit = (rec: Inflight): boolean => {
    if (!canCommit(rec)) {
      if (rec.slowTimer) clearTimeout(rec.slowTimer)
      live.delete(rec.requestId)
      if (rec.thinkingId) removeIds(new Set([rec.thinkingId]))
      return false
    }
    if (rec.slowTimer) clearTimeout(rec.slowTimer)
    committedSeq = rec.seq
    live.delete(rec.requestId)
    const stale = new Set<string>()
    if (rec.thinkingId) stale.add(rec.thinkingId)
    for (const other of live.values()) {
      if (other.seq >= rec.seq) continue
      if (other.slowTimer) clearTimeout(other.slowTimer)
      if (other.thinkingId) stale.add(other.thinkingId)
    }
    removeIds(stale)
    return true
  }

  const applyReply = (content: string, riskLevel: RiskLevel, userText: string) => {
    const { state, display } = nextRiskState({ riskActive: meta.riskActive }, riskLevel)
    meta.riskActive = state.riskActive

    if (display === 'risk') {
      meta.transitionThisSession = false
      dropCompanionFollowups()
      highCount += 1
      push({ kind: 'risk', id: nextItemId(), title: copy.riskTitle(highCount) })
      return
    }
    if (display === 'transition') {
      meta.transitionThisSession = true
      dropCompanionFollowups()
      push({ kind: 'transition', id: nextItemId(), text: copy.TRANSITION_REPLY })
      return
    }
    if (graceDue(meta, userText, now())) {
      meta.graceShown = true
      push({ kind: 'ai', id: nextItemId(), text: copy.GRACE_REPLY, followups: false })
      return
    }
    let prefix = ''
    if (crossDayCareDue(meta)) {
      prefix = copy.CROSSDAY_PREFIX + '\n\n'
      meta.crossDayCareShown = true
      options.saveMeta?.(meta)
    }
    push({ kind: 'ai', id: nextItemId(), text: prefix + content, followups: true })
  }

  const runReply = async (rec: Inflight, echoUser: boolean) => {
    if (echoUser) push({ kind: 'user', id: nextItemId(), text: rec.text })
    if (!canCommit(rec)) return

    const thinkingId = nextItemId()
    rec.thinkingId = thinkingId
    push({
      kind: 'thinking',
      id: thinkingId,
      slow: false,
      requestId: rec.requestId,
      sourceText: rec.text
    })
    rec.slowTimer = setTimeout(() => {
      if (!canCommit(rec)) return
      let changed = false
      const next = items.map((it) => {
        if (it.id !== thinkingId || it.kind !== 'thinking' || it.slow) return it
        changed = true
        return { ...it, slow: true }
      })
      if (!changed) return
      items = next
      emit()
    }, slowHintMs)

    const [res] = await Promise.all([
      sendMessage(options.gateway, {
        content: rec.text,
        anonymousId: options.getAnonymousId?.()
      }),
      delay(thinkWaitMs)
    ])
    if (!takeCommit(rec)) return
    if (!res.ok) {
      push({
        kind: 'error',
        id: nextItemId(),
        requestId: rec.requestId,
        sourceText: rec.text,
        detail: res.error.message
      })
      return
    }
    applyReply(res.value.content, res.value.riskLevel, rec.text)
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    void runReply(begin(trimmed), true)
  }

  const retry = (itemId: string) => {
    const item = items.find((it) => it.id === itemId)
    if (!item) return
    if (item.kind === 'error') {
      removeIds(new Set([item.id]))
      void runReply(begin(item.sourceText), false)
      return
    }
    if (item.kind !== 'thinking' || !item.sourceText) return
    const prev = item.requestId ? live.get(item.requestId) : undefined
    if (prev) {
      voided.add(prev.requestId)
      if (prev.slowTimer) clearTimeout(prev.slowTimer)
      live.delete(prev.requestId)
    }
    removeIds(new Set([item.id]))
    void runReply(begin(item.sourceText), false)
  }

  const followup = (kind: FollowupKind) => {
    if (kind === 'more' || kind === 'angle') {
      if (companionBlocked()) return
      const epochAt = epoch
      const thinkingId = nextItemId()
      push({ kind: 'thinking', id: thinkingId, slow: false })
      const timer = setTimeout(() => {
        followupTimers.delete(timer)
        removeIds(new Set([thinkingId]))
        if (epochAt !== epoch || companionBlocked()) return
        push({ kind: 'ai', id: nextItemId(), text: copy.FOLLOWUP_REPLY[kind], followups: false })
      }, thinkWaitMs)
      followupTimers.add(timer)
      return
    }
    if (kind === 'better') {
      if (companionBlocked()) return
      push({
        kind: 'ai',
        id: nextItemId(),
        text: copy.FOLLOWUP_REPLY.better + copy.FOLLOWUP_REPLY.betterTail,
        followups: false
      })
      return
    }
    push({ kind: 'ai', id: nextItemId(), text: copy.FOLLOWUP_REPLY[kind], followups: false })
  }

  const clearSession = () => {
    epoch += 1
    committedSeq = 0
    highCount = 0
    voided.clear()
    clearTimers()
    live.clear()
    items = []
    meta.riskActive = false
    meta.transitionThisSession = false
    meta.graceShown = false
    meta.sessionStartAt = now().getTime()
    emit()
  }

  return {
    send,
    retry,
    followup,
    clearSession,
    getSnapshot: snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}
