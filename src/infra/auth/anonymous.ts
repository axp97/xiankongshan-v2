import Taro from '@tarojs/taro'

// 匿名身份获取：weapp 走 login 云函数派生；h5 用本地随机 id（仅体验）。
// 结果缓存本地，避免每次会话重复请求。
const KEY = 'xkssv2:anon-id'
let cached: string | undefined

const safeGet = (): string | undefined => {
  try {
    const v = Taro.getStorageSync(KEY)
    return typeof v === 'string' && v ? v : undefined
  } catch {
    return undefined
  }
}
const safeSet = (id: string): void => {
  try {
    Taro.setStorageSync(KEY, id)
  } catch {
    /* 存储不可用时静默 */
  }
}

export const getAnonymousId = async (): Promise<string | undefined> => {
  if (cached) return cached
  const stored = safeGet()
  if (stored) {
    cached = stored
    return cached
  }
  if (process.env.TARO_ENV === 'weapp') {
    try {
      const res = await Taro.cloud.callFunction({ name: 'login' })
      const id = (res.result as { anonymousId?: string } | undefined)?.anonymousId
      if (id) {
        cached = id
        safeSet(id)
        return id
      }
    } catch {
      /* 派生失败不阻断主路径：anonymousId 是可选项 */
    }
    return undefined
  }
  const local = `h5_${Math.random().toString(36).slice(2, 10)}`
  cached = local
  safeSet(local)
  return local
}
