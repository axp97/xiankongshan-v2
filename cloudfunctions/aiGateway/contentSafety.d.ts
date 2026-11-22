export const SEC_MAX_UNITS: 2500

export const Screen: {
  readonly PASS: 'pass'
  readonly BLOCKED: 'blocked'
  readonly UNAVAILABLE: 'unavailable'
}

export function interpretSecCheck(input: {
  openid?: string
  response?: { result?: { suggest?: unknown } }
  error?: { errCode?: number; errcode?: number }
}): 'pass' | 'blocked' | 'unavailable'

export function gateInput(input: {
  tooLong: boolean
  screen: 'pass' | 'blocked' | 'unavailable'
}): { type: 'too_long' } | { type: 'blocked' } | { type: 'unavailable' } | { type: 'proceed' }

export function selectOutput(input: {
  modelText: string
  screen: 'pass' | 'blocked' | 'unavailable'
  fallback: string
}): string
