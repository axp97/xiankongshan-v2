import { RETENTION } from '@/shared/constants'
import { dateKey, isYesterday } from '@/shared/time'
import { type PersistedMeta, type SessionMeta } from './types'

// 关系式劝离，非时长闸门；无 streak / 召回 / 留人。全部为纯函数，便于单测。

/** 会话打开：更新当日频次与连续天数（反依赖层二/层三的计数基础）。 */
export const openSession = (prev: PersistedMeta, now: Date): PersistedMeta => {
  const today = dateKey(now)
  if (prev.lastSessionDate === today) {
    return { ...prev, dayCount: prev.dayCount + 1 }
  }
  return {
    ...prev,
    dayCount: 1,
    lastSessionDate: today,
    consecutiveDays: isYesterday(prev.lastSessionDate, now)
      ? prev.consecutiveDays + 1
      : 1
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
  m.consecutiveDays >= RETENTION.crossDayConsecutive &&
  m.dayCount >= RETENTION.crossDayDailyCount

const CLOSURE_SIGNAL =
  /(好一点|好些了|谢谢你|先这样|就这些|说完了|先到这里|收着了|没事了|缓过来)/

/** 层一 单次善终：时长进入 40–50min 窗口，或出现善尾信号；危机态豁免。 */
export const graceDue = (m: SessionMeta, userText: string, now: Date): boolean => {
  if (m.riskActive || m.graceShown) return false
  const elapsed = now.getTime() - m.sessionStartAt
  const inWindow = elapsed >= RETENTION.graceMinMs && elapsed <= RETENTION.graceMaxMs
  return inWindow || CLOSURE_SIGNAL.test(userText)
}
