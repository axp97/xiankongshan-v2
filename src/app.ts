import { Component, type PropsWithChildren } from 'react'
import './app.scss'
import { ensureCloud } from '@/infra/cloud/ensureCloud'

// 类组件的 onLaunch 会由 Taro 在小程序启动时直接调用。
class App extends Component<PropsWithChildren> {
  onLaunch() {
    try {
      ensureCloud()
    } catch (e) {
      const detail = e instanceof Error && e.message ? e.message : 'INIT_FAILED'
      console.error('[cloud] init 失败:', detail)
    }
  }

  render() {
    return this.props.children
  }
}

export default App
