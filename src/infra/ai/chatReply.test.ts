import { describe, expect, it } from 'vitest'
import { parseChatReply } from './chatReply'

const valid = {
  id: 'r1',
  content: '我在听',
  riskLevel: 'none',
  createdAt: 1
}

describe('parseChatReply', () => {
  it('四字段齐全且风险级合法时原样接受', () => {
    expect(parseChatReply(valid)).toEqual(valid)
    expect(parseChatReply({ ...valid, content: '', riskLevel: 'high' })).toEqual({
      ...valid,
      content: '',
      riskLevel: 'high'
    })
  })

  it('未知 riskLevel、缺字段、错误类型和错误码对象都拒绝', () => {
    expect(parseChatReply({ ...valid, riskLevel: 'critical' })).toBeNull()
    expect(parseChatReply({ ...valid, riskLevel: 'none ' })).toBeNull()
    expect(parseChatReply({ ...valid, content: 1 })).toBeNull()
    expect(parseChatReply({ ...valid, id: '' })).toBeNull()
    expect(parseChatReply({ ...valid, createdAt: Number.NaN })).toBeNull()
    expect(parseChatReply({ error: 'PROVIDER_SHAPE' })).toBeNull()
    expect(parseChatReply(null)).toBeNull()
  })
})
