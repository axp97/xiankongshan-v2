// 内容安全三态。只判断检测结果，不调用微信 API。
// 超限不是「截断后放行」：调用方不得把未检测的后缀送去模型或展示。
// SEC_MAX_UNITS 须与 src/shared/constants.ts 的 CONTENT_SAFETY.maxUnits 一致。

const SEC_MAX_UNITS = 2500

const Screen = {
  PASS: 'pass',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable'
}

const blockedCode = (error) => {
  const code = error && (error.errCode || error.errcode)
  return code === 87014
}

/**
 * @param {{ openid?: string, response?: { result?: { suggest?: unknown } }, error?: { errCode?: number, errcode?: number } }} input
 * @returns {'pass' | 'blocked' | 'unavailable'}
 */
const interpretSecCheck = (input) => {
  if (!input || !input.openid) return Screen.UNAVAILABLE
  if (input.error) return blockedCode(input.error) ? Screen.BLOCKED : Screen.UNAVAILABLE
  const suggest = input.response && input.response.result ? input.response.result.suggest : undefined
  if (suggest === Screen.PASS) return Screen.PASS
  if (typeof suggest === 'string') return Screen.BLOCKED
  return Screen.UNAVAILABLE
}

/**
 * @param {{ tooLong: boolean, screen: 'pass' | 'blocked' | 'unavailable' }} input
 * @returns {{ type: 'too_long' } | { type: 'blocked' } | { type: 'unavailable' } | { type: 'proceed' }}
 */
const gateInput = (input) => {
  if (input.tooLong) return { type: 'too_long' }
  if (input.screen === Screen.BLOCKED) return { type: 'blocked' }
  if (input.screen === Screen.UNAVAILABLE) return { type: 'unavailable' }
  return { type: 'proceed' }
}

/**
 * 只有完整检测通过才展示模型原文。超限、拦截、不可用都换成已审定的兜底句。
 * @param {{ modelText: string, screen: 'pass' | 'blocked' | 'unavailable', fallback: string }} input
 */
const selectOutput = (input) => {
  if (!input.modelText || input.modelText.length > SEC_MAX_UNITS) return input.fallback
  if (input.screen !== Screen.PASS) return input.fallback
  return input.modelText
}

module.exports = { SEC_MAX_UNITS, Screen, interpretSecCheck, gateInput, selectOutput }
