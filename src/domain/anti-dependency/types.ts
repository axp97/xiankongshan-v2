// 反依赖状态（product-definition.md §7）。
// 持久化字段：跨会话，仅存客户端本地（匿名，不上传服务端）。
export type PersistedMeta = {
  dayCount: number
  lastSessionDate: string | null
  /** 今天之前，连续且每天都达到高频阈值的天数。不是打卡。 */
  priorHighDays: number
  crossDayCareShown: boolean
}

// 会话内字段：不持久化，随本次会话生灭。
export type SessionMeta = PersistedMeta & {
  riskActive: boolean
  transitionThisSession: boolean
  graceShown: boolean
  sessionStartAt: number
}

export const emptyPersistedMeta = (): PersistedMeta => ({
  dayCount: 0,
  lastSessionDate: null,
  priorHighDays: 0,
  crossDayCareShown: false
})
