import { isRiskLevel, type ChatReply } from '@/domain/chat/types'

// 应用层回复的唯一收口。缺字段、类型不对、未知 riskLevel 都拒绝，不补默认值。
export const parseChatReply = (raw: unknown): ChatReply | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const record = raw as Record<string, unknown>
  if (typeof record.id !== 'string' || record.id.length === 0) return null
  if (typeof record.content !== 'string') return null
  if (!isRiskLevel(record.riskLevel)) return null
  if (typeof record.createdAt !== 'number' || !Number.isFinite(record.createdAt)) return null
  return {
    id: record.id,
    content: record.content,
    riskLevel: record.riskLevel,
    createdAt: record.createdAt
  }
}
