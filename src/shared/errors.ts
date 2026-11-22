// 稳定应用错误码：UI 只依赖这些码，不依赖任何提供方原生错误。
export const ErrorCode = {
  Network: 'NETWORK',
  Timeout: 'TIMEOUT',
  EmptyInput: 'EMPTY_INPUT',
  Gateway: 'GATEWAY',
  Unknown: 'UNKNOWN',
  InputTooLong: 'INPUT_TOO_LONG'
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export type AppError = {
  readonly code: ErrorCode
  readonly message: string
  readonly retryable: boolean
}

export const appError = (
  code: ErrorCode,
  message: string,
  retryable: boolean
): AppError => ({ code, message, retryable })

export const UserMessage = {
  inputTooLong: '这一次有点长。先留住前面这些，剩下的下一条再说。',
  secUnavailable: '这次没能完成内容检查，所以没有继续。你的话还在，可以稍后再试。'
} as const
