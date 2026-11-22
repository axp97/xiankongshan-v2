import Taro from '@tarojs/taro'

// 小程序云能力必须先 init 再 callFunction。
// Taro 的 useLaunch 在 useLayoutEffect 里才登记，赶不上已经发生的 onLaunch。
let started = false

export const ensureCloud = (): void => {
  if (process.env.TARO_ENV !== 'weapp' || started) return
  const env = process.env.TARO_APP_CLOUD_ENV
  Taro.cloud.init(env ? { env, traceUser: false } : { traceUser: false })
  started = true
  console.info('[cloud] init 完成')
}
