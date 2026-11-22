import { describe, expect, it } from 'vitest'
import { RISK_LEVELS as appLevels } from '@/domain/chat/types'
import { ProviderCode, RISK_LEVELS, normalizeProviderHttp } from '../../../cloudfunctions/aiGateway/providerReply.js'

const completion = (payload: unknown): string =>
  JSON.stringify({
    choices: [{ message: { content: JSON.stringify(payload) } }]
  })

const validBody = completion({ riskLevel: 'none', content: '我在听' })

describe('normalizeProviderHttp', () => {
  it('应用层与云端的风险四档保持同一份顺序', () => {
    expect([...RISK_LEVELS]).toEqual([...appLevels])
  })

  it('401/403/429/500 即使正文像成功补全，也返回对应错误码', () => {
    expect(normalizeProviderHttp(401, validBody)).toEqual({ error: ProviderCode.AUTH })
    expect(normalizeProviderHttp(403, validBody)).toEqual({ error: ProviderCode.AUTH })
    expect(normalizeProviderHttp(429, validBody)).toEqual({ error: ProviderCode.RATE_LIMIT })
    expect(normalizeProviderHttp(500, validBody)).toEqual({ error: ProviderCode.UPSTREAM })
  })

  it('空 choices、非法 JSON、未知 riskLevel 和错误字段类型都是 SHAPE', () => {
    expect(normalizeProviderHttp(200, '{}')).toEqual({ error: ProviderCode.SHAPE })
    expect(normalizeProviderHttp(200, 'not-json')).toEqual({ error: ProviderCode.SHAPE })
    expect(normalizeProviderHttp(200, completion('不是 JSON 对象'))).toEqual({ error: ProviderCode.SHAPE })
    expect(normalizeProviderHttp(200, completion({ riskLevel: 'critical', content: '嗯' }))).toEqual({
      error: ProviderCode.SHAPE
    })
    expect(normalizeProviderHttp(200, completion({ riskLevel: 'none', content: 1 }))).toEqual({
      error: ProviderCode.SHAPE
    })
    expect(normalizeProviderHttp(200, JSON.stringify({ choices: [] }))).toEqual({ error: ProviderCode.SHAPE })
  })

  it('合法补全保留原文和风险级，空 content 也不改成 none', () => {
    expect(normalizeProviderHttp(200, validBody)).toEqual({ content: '我在听', riskLevel: 'none' })
    expect(normalizeProviderHttp(200, completion({ riskLevel: 'high', content: '' }))).toEqual({
      content: '',
      riskLevel: 'high'
    })
  })
})
