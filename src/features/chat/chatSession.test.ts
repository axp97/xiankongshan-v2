import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appError, ErrorCode, type AppError } from '@/shared/errors'
import { err, ok, type Result } from '@/shared/result'
import type { AiGatewayPort } from '@/domain/chat/ports'
import type { ChatReply, RiskLevel } from '@/domain/chat/types'
import { emptyPersistedMeta, type SessionMeta } from '@/domain/anti-dependency/types'
import { startSession } from '@/domain/anti-dependency/antiDependency'
import { FOLLOWUP_REPLY, GRACE_REPLY } from './copy'
import { createChatSession, type ChatSession } from './chatSession'
import type { StreamItem } from './messages'

const THINK = 100
const SLOW = 40

type Pending = {
  message: string
  resolve: (value: Result<ChatReply, AppError>) => void
}

const reply = (riskLevel: RiskLevel, content: string): ChatReply => ({
  id: `r-${riskLevel}-${content}`,
  content,
  riskLevel,
  createdAt: 1
})

const networkError = () => err(appError(ErrorCode.Network, '这条没能发出去', true))

describe('chatSession 请求代次', () => {
  let clock = new Date('2026-11-16T12:00:00').getTime()
  let pending: Pending[]
  let meta: SessionMeta
  let session: ChatSession

  beforeEach(() => {
    vi.useFakeTimers()
    clock = new Date('2026-11-16T12:00:00').getTime()
    pending = []
    meta = startSession(emptyPersistedMeta(), new Date(clock))
    meta.dayCount = 2
    const gateway: AiGatewayPort = {
      send(request) {
        return new Promise((resolve) => {
          pending.push({ message: request.message, resolve })
        })
      }
    }
    session = createChatSession({
      gateway,
      meta,
      now: () => new Date(clock),
      thinkWaitMs: THINK,
      slowHintMs: SLOW
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const deliver = async (index: number, value: Result<ChatReply, AppError>) => {
    pending[index].resolve(value)
    await vi.advanceTimersByTimeAsync(THINK)
  }

  const kinds = () => session.getSnapshot().items.map((it) => it.kind)

  const texts = (kind: StreamItem['kind']) =>
    session
      .getSnapshot()
      .items.filter((it) => it.kind === kind)
      .map((it) => (it.kind === 'user' || it.kind === 'ai' || it.kind === 'transition' ? it.text : it.kind))

  it('先返回的 high 不被后返回的 normal 降成 transition', async () => {
    session.send('今天还好')
    session.send('不想活')
    await deliver(1, ok(reply('high', '')))

    expect(session.getSnapshot().riskActive).toBe(true)
    expect(kinds()).toContain('risk')

    await deliver(0, ok(reply('none', '晚到的普通回复')))

    expect(session.getSnapshot().riskActive).toBe(true)
    expect(kinds()).not.toContain('transition')
    expect(texts('ai')).not.toContain('晚到的普通回复')
    expect(texts('user')).toEqual(['今天还好', '不想活'])
  })

  it('更早的请求先返回时仍落地，之后的 high 再让位', async () => {
    session.send('今天还好')
    session.send('不想活')
    await deliver(0, ok(reply('none', '先听见')))
    await deliver(1, ok(reply('high', '')))

    expect(texts('ai')).toContain('先听见')
    expect(session.getSnapshot().riskActive).toBe(true)
    expect(kinds().filter((kind) => kind === 'risk')).toHaveLength(1)
  })

  it('A 失败后再发 B，重试只重发 A，并保留 B 的错误', async () => {
    session.send('句子A')
    await deliver(0, networkError())
    session.send('句子B')
    await deliver(1, networkError())

    const errors = session.getSnapshot().items.filter((it) => it.kind === 'error')
    expect(errors.map((it) => it.sourceText)).toEqual(['句子A', '句子B'])

    session.retry(errors[0].id)

    expect(pending).toHaveLength(3)
    expect(pending[2].message).toBe('句子A')
    expect(
      session
        .getSnapshot()
        .items.filter((it) => it.kind === 'error')
        .map((it) => it.sourceText)
    ).toEqual(['句子B'])
  })

  it('慢重试作废原请求，只保留后一次回复', async () => {
    session.send('句子A')
    await vi.advanceTimersByTimeAsync(SLOW)
    const thinking = session.getSnapshot().items.find((it) => it.kind === 'thinking')
    expect(thinking?.kind === 'thinking' && thinking.slow).toBe(true)

    session.retry(thinking?.id ?? '')
    expect(pending.map((call) => call.message)).toEqual(['句子A', '句子A'])
    expect(session.getSnapshot().items.filter((it) => it.kind === 'user')).toHaveLength(1)

    await deliver(0, ok(reply('none', '旧回复')))
    await deliver(1, ok(reply('none', '新回复')))

    expect(texts('ai')).toEqual(['新回复'])
    expect(kinds().filter((kind) => kind === 'thinking')).toHaveLength(0)
  })

  it('清除后在途回复、followup 和定时器都不能写回，会话元状态重置', async () => {
    session.send('不想活')
    await deliver(0, ok(reply('high', '')))
    session.send('今天还好')
    await deliver(1, ok(reply('none', '过渡前')))
    expect(meta.transitionThisSession).toBe(true)
    expect(session.getSnapshot().riskActive).toBe(false)

    session.send('还在路上')
    await vi.advanceTimersByTimeAsync(THINK)
    session.followup('more')
    expect(kinds().filter((kind) => kind === 'thinking')).toHaveLength(1)

    clock += 1000
    session.clearSession()

    expect(session.getSnapshot().items).toEqual([])
    expect(session.getSnapshot().riskActive).toBe(false)
    expect(meta.transitionThisSession).toBe(false)
    expect(meta.graceShown).toBe(false)
    expect(meta.dayCount).toBe(2)
    expect(meta.sessionStartAt).toBe(clock)

    pending[2].resolve(ok(reply('none', '清除后不该出现')))
    await vi.advanceTimersByTimeAsync(THINK)
    expect(session.getSnapshot().items).toEqual([])
    expect(texts('ai')).not.toContain(FOLLOWUP_REPLY.more)

    session.send('重新开始')
    await deliver(3, ok(reply('none', '新的一句')))
    expect(texts('ai')).toEqual(['新的一句'])
    expect(kinds()).not.toContain('transition')
  })

  it('提供方错误不会把已有 high 降成 transition', async () => {
    session.send('不想活')
    await deliver(0, ok(reply('high', '')))
    session.send('今天还好')
    await deliver(1, networkError())

    expect(session.getSnapshot().riskActive).toBe(true)
    expect(kinds()).toContain('risk')
    expect(kinds()).toContain('error')
    expect(kinds()).not.toContain('transition')
  })

  it('同一会话的善终只出现一次，过渡期不再插入善终', async () => {
    session.send('谢谢你')
    await deliver(0, ok(reply('none', '在')))
    session.send('好一点')
    await deliver(1, ok(reply('none', '还在')))
    expect(texts('ai').filter((text) => text === GRACE_REPLY)).toHaveLength(1)

    session.clearSession()
    session.send('不想活')
    await deliver(2, ok(reply('high', '')))
    session.send('缓过来了')
    await deliver(3, ok(reply('none', '过渡')))
    session.send('谢谢你')
    await deliver(4, ok(reply('none', '普通回应')))
    expect(texts('ai').filter((text) => text === GRACE_REPLY)).toHaveLength(0)
    expect(texts('ai')).toContain('普通回应')
  })

  it('high 落地时取消尚未结束的普通 followup，过渡期也不再插入陪聊', async () => {
    session.send('今天还好')
    await deliver(0, ok(reply('none', '听见了')))
    session.send('不想活')
    session.followup('more')
    expect(kinds()).toContain('thinking')

    await deliver(1, ok(reply('high', '')))

    expect(session.getSnapshot().riskActive).toBe(true)
    expect(session.getSnapshot().companionFollowups).toBe(false)
    expect(texts('ai')).not.toContain(FOLLOWUP_REPLY.more)
    expect(kinds()).toContain('risk')
    expect(kinds()).not.toContain('thinking')

    session.followup('more')
    session.followup('better')
    await vi.advanceTimersByTimeAsync(THINK)
    expect(texts('ai')).not.toContain(FOLLOWUP_REPLY.more)
    expect(texts('ai').join('')).not.toContain(FOLLOWUP_REPLY.better)
    session.followup('stay')
    expect(texts('ai')).toContain(FOLLOWUP_REPLY.stay)

    session.send('缓过来了')
    await deliver(2, ok(reply('none', '过渡前')))
    expect(session.getSnapshot().companionFollowups).toBe(false)
    session.followup('angle')
    await vi.advanceTimersByTimeAsync(THINK)
    expect(texts('ai')).not.toContain(FOLLOWUP_REPLY.angle)
  })

  it('未清除时，延迟 followup 会在思考结束后落地', async () => {
    session.send('句子A')
    await deliver(0, ok(reply('none', '听见了')))
    session.followup('more')
    await vi.advanceTimersByTimeAsync(THINK)
    expect(texts('ai')).toContain(FOLLOWUP_REPLY.more)
  })
})
