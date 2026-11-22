import { describe, it, expect } from 'vitest'
import { emptyPersistedMeta } from './types'
import {
  openSession,
  startSession,
  parsePersistedMeta,
  frequencyNoticeDue,
  crossDayCareDue,
  graceDue
} from './antiDependency'
import { RETENTION } from '@/shared/constants'

const at = (s: string) => new Date(s)

describe('反依赖 · 层二 当日频次', () => {
  it('同日多次打开累加，第 3 次达到觉察阈值', () => {
    let p = emptyPersistedMeta()
    p = openSession(p, at('2026-07-06T10:00:00'))
    p = openSession(p, at('2026-07-06T13:00:00'))
    p = openSession(p, at('2026-07-06T20:00:00'))
    expect(p.dayCount).toBe(3)
    expect(frequencyNoticeDue(startSession(p, at('2026-07-06T20:00:00')))).toBe(true)
  })

  it('危机态豁免：riskActive 时静默', () => {
    let p = emptyPersistedMeta()
    for (let i = 0; i < 3; i++) p = openSession(p, at('2026-07-06T10:00:00'))
    const s = { ...startSession(p, at('2026-07-06T10:00:00')), riskActive: true }
    expect(frequencyNoticeDue(s)).toBe(false)
  })
})

describe('反依赖 · 层三 跨日重度关怀', () => {
  it('连续天数达标且当日高频 → 触发，且终身一次', () => {
    let p = emptyPersistedMeta()
    // 连续 4 天，每天至少 3 次
    const days = ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06']
    for (const d of days) {
      p = openSession(p, at(`${d}T09:00:00`))
      p = openSession(p, at(`${d}T12:00:00`))
      p = openSession(p, at(`${d}T21:00:00`))
    }
    expect(p.priorHighDays).toBe(RETENTION.crossDayConsecutive - 1)
    const s = startSession(p, at('2026-07-06T21:00:00'))
    expect(crossDayCareDue(s)).toBe(true)
    expect(crossDayCareDue({ ...s, crossDayCareShown: true })).toBe(false)
  })

  it('前面几天只打开过、当天才高频，不构成连续高频', () => {
    let p = emptyPersistedMeta()
    for (const d of ['2026-07-03', '2026-07-04', '2026-07-05']) {
      p = openSession(p, at(`${d}T09:00:00`))
    }
    p = openSession(p, at('2026-07-06T09:00:00'))
    p = openSession(p, at('2026-07-06T12:00:00'))
    p = openSession(p, at('2026-07-06T21:00:00'))
    expect(crossDayCareDue(startSession(p, at('2026-07-06T21:00:00')))).toBe(false)
  })

  it('中间有一天未达高频，连续计数清零', () => {
    let p = emptyPersistedMeta()
    for (const d of ['2026-07-03', '2026-07-04']) {
      p = openSession(p, at(`${d}T09:00:00`))
      p = openSession(p, at(`${d}T12:00:00`))
      p = openSession(p, at(`${d}T21:00:00`))
    }
    p = openSession(p, at('2026-07-05T09:00:00'))
    for (let i = 0; i < 3; i++) p = openSession(p, at('2026-07-06T10:00:00'))
    expect(p.priorHighDays).toBe(0)
    expect(crossDayCareDue(startSession(p, at('2026-07-06T10:00:00')))).toBe(false)
  })

  it('过渡期与危机态一样，三层都静默', () => {
    let p = emptyPersistedMeta()
    const days = ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06']
    for (const d of days) {
      p = openSession(p, at(`${d}T09:00:00`))
      p = openSession(p, at(`${d}T12:00:00`))
      p = openSession(p, at(`${d}T21:00:00`))
    }
    const s = {
      ...startSession(p, at('2026-07-06T21:00:00')),
      transitionThisSession: true
    }
    expect(frequencyNoticeDue(s)).toBe(false)
    expect(crossDayCareDue(s)).toBe(false)
    expect(graceDue(s, '谢谢你', at('2026-07-06T21:05:00'))).toBe(false)
  })
})

describe('反依赖 · 层一 单次善终', () => {
  it('善尾信号立即触发；危机态豁免', () => {
    const base = startSession(emptyPersistedMeta(), at('2026-07-06T10:00:00'))
    expect(graceDue(base, '谢谢你，我好一点了', at('2026-07-06T10:05:00'))).toBe(true)
    expect(graceDue({ ...base, riskActive: true }, '谢谢你', at('2026-07-06T10:05:00'))).toBe(false)
  })

  it('时长进入 40–50min 窗口触发', () => {
    const base = startSession(emptyPersistedMeta(), at('2026-07-06T10:00:00'))
    const now = new Date(base.sessionStartAt + 42 * 60 * 1000)
    expect(graceDue(base, '还在想', now)).toBe(true)
  })

  it('本会话已经出现过善终，不再次触发', () => {
    const base = startSession(emptyPersistedMeta(), at('2026-07-06T10:00:00'))
    expect(graceDue({ ...base, graceShown: true }, '谢谢你', at('2026-07-06T10:05:00'))).toBe(false)
  })
})

describe('反依赖 · 持久化校验', () => {
  it('字段齐全时保留；旧数据没有高频历史则从零开始', () => {
    expect(
      parsePersistedMeta({
        dayCount: 2,
        lastSessionDate: '2026-7-6',
        priorHighDays: 1,
        crossDayCareShown: false
      })
    ).toEqual({
      dayCount: 2,
      lastSessionDate: '2026-7-6',
      priorHighDays: 1,
      crossDayCareShown: false
    })
    expect(
      parsePersistedMeta({
        dayCount: 2,
        lastSessionDate: '2026-7-6',
        consecutiveDays: 4,
        crossDayCareShown: false
      }).priorHighDays
    ).toBe(0)
  })

  it('类型不对、负数或日期损坏时整份丢弃', () => {
    const blank = emptyPersistedMeta()
    expect(parsePersistedMeta(null)).toEqual(blank)
    expect(parsePersistedMeta({ dayCount: '3', lastSessionDate: null, crossDayCareShown: false })).toEqual(blank)
    expect(parsePersistedMeta({ dayCount: -1, lastSessionDate: null, priorHighDays: 0, crossDayCareShown: false })).toEqual(
      blank
    )
    expect(
      parsePersistedMeta({ dayCount: 1, lastSessionDate: '昨天', priorHighDays: 0, crossDayCareShown: false })
    ).toEqual(blank)
  })
})
