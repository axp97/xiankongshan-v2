// 会话流条目模型：UI 只按 kind 渲染，不感知来源。
// error / 慢思考携带 sourceText，重试只发这一条原文，不靠全局 lastUserText。
export type StreamItem =
  | { readonly kind: 'user'; readonly id: string; readonly text: string }
  | { readonly kind: 'ai'; readonly id: string; readonly text: string; readonly followups: boolean }
  | { readonly kind: 'transition'; readonly id: string; readonly text: string }
  | { readonly kind: 'risk'; readonly id: string; readonly title: string }
  | {
      readonly kind: 'thinking'
      readonly id: string
      readonly slow: boolean
      readonly requestId?: string
      readonly sourceText?: string
    }
  | { readonly kind: 'error'; readonly id: string; readonly requestId: string; readonly sourceText: string; readonly detail?: string }

export type FollowupKind = 'more' | 'angle' | 'better' | 'reach' | 'stay'
