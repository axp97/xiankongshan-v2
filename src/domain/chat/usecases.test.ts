import { describe, expect, it } from 'vitest'
import { ok } from '@/shared/result'
import { CONTENT_SAFETY } from '@/shared/constants'
import { ErrorCode } from '@/shared/errors'
import type { AiGatewayPort } from './ports'
import { sendMessage } from './usecases'

const gateway: AiGatewayPort = {
  async send() {
    return ok({ id: 'r', content: '在', riskLevel: 'none', createdAt: 1 })
  }
}

describe('sendMessage', () => {
  it('超过上限时不调用网关', async () => {
    let called = false
    const watching: AiGatewayPort = {
      async send(request) {
        called = true
        return gateway.send(request)
      }
    }
    const res = await sendMessage(watching, { content: '啊'.repeat(CONTENT_SAFETY.maxUnits + 1) })
    expect(called).toBe(false)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe(ErrorCode.InputTooLong)
  })
})
