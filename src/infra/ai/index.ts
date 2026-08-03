import type { AiGatewayPort } from '@/domain/chat/ports'
import { createStubGateway } from './stubGateway'
import { createCloudGateway } from './cloudGateway'

// 工厂：按运行环境选择网关实现。UI 只依赖端口，永不感知具体适配器。
//   —— weapp：走微信云 aiGateway 云函数（生产路径）
//   —— h5 / 其它：本地桩（即时可验证，无需部署云端）
let singleton: AiGatewayPort | null = null

export const getAiGateway = (): AiGatewayPort => {
  if (singleton) return singleton
  singleton = process.env.TARO_ENV === 'weapp' ? createCloudGateway() : createStubGateway()
  return singleton
}
