// 时序与存储键的单一来源，跨领域/基础设施复用。
export const TIMING = {
  /** 思考态到回复的等待（prefers-reduced-motion 时缩短） */
  thinkWaitMs: 1500,
  thinkWaitReducedMs: 500,
  /** 超过此时长在思考态追加“有点慢”提示 */
  slowHintMs: 15000,
  /** 输入坞轻推提示驻留 */
  nudgeMs: 2600
} as const

export const RETENTION = {
  /** 单次善终时长窗口（反依赖层一） */
  graceMinMs: 40 * 60 * 1000,
  graceMaxMs: 50 * 60 * 1000,
  /** 当日频次觉察阈值（反依赖层二） */
  frequencyNoticeThreshold: 3,
  /** 跨日重度关怀阈值（反依赖层三） */
  crossDayConsecutive: 4,
  crossDayDailyCount: 3
} as const

export const STORAGE_KEY = {
  antiDependency: 'xkssv2:anti-dep'
} as const
