// 稳定应用错误码：UI 只依赖这些码，不依赖任何提供方原生错误。
export const ErrorCode = {
  Network: 'NETWORK',
  Timeout: 'TIMEOUT',
  EmptyInput: 'EMPTY_INPUT',
  Gateway: 'GATEWAY',
  Unknown: 'UNKNOWN'
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
