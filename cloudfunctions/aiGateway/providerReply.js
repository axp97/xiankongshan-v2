// DeepSeek HTTP → 应用层字段或稳定错误码。
// 非 2xx 即使正文像一次成功补全，也不得变成 ChatReply。
// 未知 riskLevel 不得降成 none。risk 四档须与 src/domain/chat/types.ts 的 RISK_LEVELS 一致。

const RISK_LEVELS = ['none', 'low', 'medium', 'high']

const ProviderCode = {
  AUTH: 'PROVIDER_AUTH',
  RATE_LIMIT: 'PROVIDER_RATE_LIMIT',
  UPSTREAM: 'PROVIDER_UPSTREAM',
  SHAPE: 'PROVIDER_SHAPE'
}

const httpErrorCode = (statusCode) => {
  if (statusCode === 401 || statusCode === 403) return ProviderCode.AUTH
  if (statusCode === 429) return ProviderCode.RATE_LIMIT
  return ProviderCode.UPSTREAM
}

const fail = (error) => ({ error })

/**
 * @param {number} statusCode
 * @param {string} bodyText
 * @returns {{ content: string, riskLevel: string } | { error: string }}
 */
const normalizeProviderHttp = (statusCode, bodyText) => {
  const status = Number(statusCode)
  if (!Number.isInteger(status) || status < 200 || status >= 300) {
    return fail(httpErrorCode(status))
  }

  let body
  try {
    body = JSON.parse(bodyText)
  } catch {
    return fail(ProviderCode.SHAPE)
  }

  const message = body && body.choices && body.choices[0] ? body.choices[0].message : undefined
  const raw = message ? message.content : undefined
  if (typeof raw !== 'string') return fail(ProviderCode.SHAPE)

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return fail(ProviderCode.SHAPE)
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(ProviderCode.SHAPE)
  if (typeof parsed.riskLevel !== 'string' || !RISK_LEVELS.includes(parsed.riskLevel)) {
    return fail(ProviderCode.SHAPE)
  }
  if (typeof parsed.content !== 'string') return fail(ProviderCode.SHAPE)

  return { content: parsed.content, riskLevel: parsed.riskLevel }
}

module.exports = { RISK_LEVELS, ProviderCode, normalizeProviderHttp }
