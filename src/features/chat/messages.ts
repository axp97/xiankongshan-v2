// 会话流条目模型：UI 只按 kind 渲染，不感知来源。
export type StreamItem =
  | { readonly kind: 'user'; readonly id: string; readonly text: string }
  | { readonly kind: 'ai'; readonly id: string; readonly text: string; readonly followups: boolean }
  | { readonly kind: 'transition'; readonly id: string; readonly text: string }
  | { readonly kind: 'risk'; readonly id: string; readonly title: string }
  | { readonly kind: 'thinking'; readonly id: string; readonly slow: boolean }
  | { readonly kind: 'error'; readonly id: string }

export type FollowupKind = 'more' | 'angle' | 'better' | 'reach' | 'stay'
