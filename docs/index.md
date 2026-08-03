# 陷空山 V2 文档索引

## 1. 当前状态

> **活状态以 `../harness/` 为准**（本文件只做架构/规格索引，避免双进度源）。

- 项目：陷空山 V2（全新重写，ADR-001）
- 活进度：`../harness/plan.md` + `../harness/memory.md`（含 `## NEXT`）
- Agent 入口：`../AGENTS.md`
- 架构事实源：`../harness/rules.md`、`./architecture.md`、`./verification.md`

## 2. 阅读入口

Agent 执行任务请走 `../AGENTS.md` 冷启动。人类读架构时按序：

1. `../harness/rules.md`
2. `./architecture.md`
3. `./verification.md`
4. `../harness/protocol.md`
5. `./specs/phase-1-minimal-chat.md`
6. `../reference/陷空山UX设计/product-definition.md`（产品 MVP 契约）

## 3. 核心架构决策

- `./adr/ADR-001-greenfield-v2.md`
- `./adr/ADR-002-frontend-stack.md`
- `./adr/ADR-003-cloud-bff-ai-gateway.md`
- `./adr/ADR-004-mvp-scope-alignment.md`
- `./adr/ADR-005-session-retention.md`

## 4. 当前生效规格

- `./specs/phase-1-minimal-chat.md`（阶段 1 架构验证切片；非产品 MVP）
- `./privacy-guideline.md`（隐私申报草案，待主体审定）

## 5. 阶段摘要

> 术语（见 `./adr/ADR-004-mvp-scope-alignment.md`）：**阶段 1 是架构验证切片，不是产品 MVP**；**产品 MVP = product-definition.md 契约，落在阶段 2**。

| 阶段   | 目标                                                                   | 状态（摘要）                          |
| ------ | ---------------------------------------------------------------------- | ------------------------------------- |
| 阶段 0 | 确认架构、规则和验证协议                                               | 完成（规则已迁入 harness）            |
| 阶段 1 | 架构验证切片：Taro + React + 云 BFF + AI 网关（非 MVP）                | 完成（真 AI + 分层底座已通）          |
| 阶段 2 | 产品 MVP：风险四档、反依赖四层、保真 UI、安全合规、体验版内测          | 进行中 → 见 `../harness/plan.md`      |
| 阶段 3 | 树洞主路径                                                             | 尚未开始                              |
| 阶段 4 | 生产治理                                                               | 尚未开始                              |

## 6. 阶段 1 非目标（历史约束，已兑现）

- 不从旧项目完整迁移功能。
- 不实现树洞。
- 不抽取复杂 monorepo。
- 不提出未经验证的安全声明。
- UI 不直接接入 AI 提供方协议。
