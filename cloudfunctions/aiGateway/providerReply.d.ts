export const RISK_LEVELS: readonly ['none', 'low', 'medium', 'high']

export const ProviderCode: {
  readonly AUTH: 'PROVIDER_AUTH'
  readonly RATE_LIMIT: 'PROVIDER_RATE_LIMIT'
  readonly UPSTREAM: 'PROVIDER_UPSTREAM'
  readonly SHAPE: 'PROVIDER_SHAPE'
}

export type ProviderSuccess = {
  readonly content: string
  readonly riskLevel: 'none' | 'low' | 'medium' | 'high'
}

export type ProviderFailure = {
  readonly error: 'PROVIDER_AUTH' | 'PROVIDER_RATE_LIMIT' | 'PROVIDER_UPSTREAM' | 'PROVIDER_SHAPE'
}

export function normalizeProviderHttp(statusCode: number, bodyText: string): ProviderSuccess | ProviderFailure
