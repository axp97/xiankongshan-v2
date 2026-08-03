import Taro from '@tarojs/taro'
import { STORAGE_KEY } from '@/shared/constants'
import { type PersistedMeta, emptyPersistedMeta } from '@/domain/anti-dependency/types'

// 反依赖持久化：仅客户端本地，不上传服务端（匿名性边界）。
export const loadAntiDep = (): PersistedMeta => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY.antiDependency)
    if (!raw) return emptyPersistedMeta()
    const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { ...emptyPersistedMeta(), ...(parsed as Partial<PersistedMeta>) }
  } catch {
    return emptyPersistedMeta()
  }
}

export const saveAntiDep = (meta: PersistedMeta): void => {
  const persisted: PersistedMeta = {
    dayCount: meta.dayCount,
    lastSessionDate: meta.lastSessionDate,
    consecutiveDays: meta.consecutiveDays,
    crossDayCareShown: meta.crossDayCareShown
  }
  try {
    Taro.setStorageSync(STORAGE_KEY.antiDependency, JSON.stringify(persisted))
  } catch {
    /* 存储不可用时静默降级：反依赖是增益，不阻断主路径 */
  }
}
