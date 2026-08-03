import type { IconName } from '@/shared/ui/icons'

// 信任与边界文案：只说现在能做到的，不夸大（product-definition.md §8）。
// 五项对齐 home.html；会话页同用（含清除按钮时由 TrustSheet onClear 控制）。
export const TRUST: {
  title: string
  sub: string
  clear: string
  done: string
  items: Array<{ icon: IconName; t: string; d: string }>
} = {
  title: '隐私与边界',
  sub: '我们只说现在能做到的，不夸大。',
  clear: '清除本次内容',
  done: '我知道了',
  items: [
    { icon: 'person', t: '匿名使用', d: '不需要注册、不绑定身份，也不要求你说出「你是谁」。' },
    { icon: 'lock', t: '密钥只在服务端', d: '模型接口密钥保存在服务器，不写进小程序客户端。' },
    { icon: 'shield', t: '不用于训练', d: '你的输入不会用于模型训练，也不建立用户画像。' },
    { icon: 'trash', t: '可随时清除本次内容', d: '你可以一键清空这次会话，从这台设备上移除。' },
    {
      icon: 'shieldCheck',
      t: '情绪支持，不是医疗诊断',
      d: '这里的回应只陪你整理情绪，不替代医生或专业治疗。'
    }
  ]
}
