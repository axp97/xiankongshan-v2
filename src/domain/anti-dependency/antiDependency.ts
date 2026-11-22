import { RETENTION } from '@/shared/constants'
import { dateKey, isYesterday } from '@/shared/time'
import { emptyPersistedMeta, type PersistedMeta, type SessionMeta } from './types'

// 关系式劝离，非时长闸门；无 streak / 召回 / 留人。全部为纯函数，便于单测。

const DATE_KEY = /^\d{4}-\d{1,2}-\d{1,2}$/
const MAX_COUNT = 10000

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_COUNT

/** 损坏或旧结构无法证明高频历史时，整份降为空白。不把“连续打开”当成“连续高频”。 */
export const parsePersistedMeta = (value: unknown): PersistedMeta => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return emptyPersistedMeta()
  const raw = value as Record<string, unknown>
  const prior = raw.priorHighDays === undefined ? 0 : raw.priorHighDays
  if (!isCount(raw.dayCount) || !isCount(prior)) return emptyPersistedMeta()
  if (raw.lastSessionDate !== null && (typeof raw.lastSessionDate !== 'string' || !DATE_KEY.test(raw.lastSessionDate))) {
    return emptyPersistedMeta()
  }
  if (typeof raw.crossDayCareShown !== 'boolean') return emptyPersistedMeta()
  return {
    dayCount: raw.dayCount,
    lastSessionDate: raw.lastSessionDate,
    priorHighDays: prior,
    crossDayCareShown: raw.crossDayCareShown
  }
}

/** 会话打开：只累加当天次数。跨日时，仅昨天本身达到高频才延续 priorHighDays。 */
export const openSession = (prev: PersistedMeta, now: Date): PersistedMeta => {
  const today = dateKey(now)
  if (prev.lastSessionDate === today) {
    return { ...prev, dayCount: prev.dayCount + 1 }
  }
  const yesterdayWasHigh =
    isYesterday(prev.lastSessionDate, now) && prev.dayCount >= RETENTION.crossDayDailyCount
  return {
    ...prev,
    dayCount: 1,
    lastSessionDate: today,
    priorHighDays: yesterdayWasHigh ? prev.priorHighDays + 1 : 0
  }
}

export const startSession = (persisted: PersistedMeta, now: Date): SessionMeta => ({
  ...persisted,
  riskActive: false,
  transitionThisSession: false,
  graceShown: false,
  sessionStartAt: now.getTime()
})

/** 危机豁免（层四）：high 或当次会话经历过 high 过渡时，层一二三全静默。 */
const exempt = (m: SessionMeta): boolean => m.riskActive || m.transitionThisSession

/** 层二 当日频次觉察：同日第 3 次起承认“来了几次”，不显示数字。 */
export const frequencyNoticeDue = (m: SessionMeta): boolean =>
  !exempt(m) && m.dayCount >= RETENTION.frequencyNoticeThreshold

/** 层三 跨日重度关怀：连续多日高频，终身仅一次。 */
export const crossDayCareDue = (m: SessionMeta): boolean =>
  !exempt(m) &&
  !m.crossDayCareShown &&
  m.dayCount >= RETENTION.crossDayDailyCount &&
  m.priorHighDays + 1 >= RETENTION.crossDayConsecutive

const CLOSURE_SIGNAL =
  /(好一点|好些了|谢谢你|先这样|就这些|说完了|先到这里|收着了|没事了|缓过来)/

/** 层一 单次善终：时长进入 40–50min 窗口，或出现善尾信号；危机态豁免。 */
export const graceDue = (m: SessionMeta, userText: string, now: Date): boolean => {
  if (exempt(m) || m.graceShown) return false
  const elapsed = now.getTime() - m.sessionStartAt
  const inWindow = elapsed >= RETENTION.graceMinMs && elapsed <= RETENTION.graceMaxMs
  return inWindow || CLOSURE_SIGNAL.test(userText)
}
