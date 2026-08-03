import { type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

// weapp 下初始化云环境（h5 无 cloud，跳过）。
// 环境 ID：复制 `.env.example` → `.env`，填写 `TARO_APP_CLOUD_ENV`；未填则走开发者工具当前云环境。
if (process.env.TARO_ENV === 'weapp') {
  try {
    const env = process.env.TARO_APP_CLOUD_ENV
    Taro.cloud.init(env ? { env, traceUser: false } : { traceUser: false })
  } catch {
    /* 未开通云环境时静默，主路径仍可用桩体验 */
  }
}

// 应用壳：仅装配，不含业务逻辑（对齐 architecture.md 分层职责）。
const App = ({ children }: PropsWithChildren) => children

export default App
