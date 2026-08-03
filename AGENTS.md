# 陷空山 V2 · Agent 入口

匿名情绪陪伴微信小程序。Taro 4 + React + TypeScript（严格模式），微信云开发作 BFF，AI 统一走 `aiGateway` 云函数（DeepSeek，密钥只在云端）。

## 冷启动协议（任何 AI / 任何新窗口，一致执行）

跳过本协议 = 偏离。顺序不可改：

1. **定位**：读 `harness/memory.md` 的 `## NEXT` 与「当前状态」→ 读 `harness/plan.md`。
2. **取任务**：plan 中最靠前、未勾选、优先级最高（P0 > P1 > P2）、负责方为「我」的一项。不要自造任务；不要重开 `docs/adr/` 已裁决问题。
3. **阻塞分流**：负责方为「你」的事项只提醒、不代办、不阻塞其余「我」可做项。标有「待真机/待你确认」的不做盲改。
4. **执行**：守 `harness/rules.md`；UI 以 `reference/陷空山UX设计/{home,chat,design-system}.html` 为像素契约；产品边界以 `reference/陷空山UX设计/product-definition.md` 为准。
5. **完成定义**（三者缺一不算完成）：
   - `npm run verify` 全绿
   - 勾选 `harness/plan.md` 对应项
   - 刷新 `harness/memory.md` 的「当前状态」与 `## NEXT`

## 必读（按序）

1. `harness/rules.md` — 最高工程规则（冲突时的裁决顺序在其 §1）
2. `harness/protocol.md` — 执行器协议（任务输入输出、会话收尾、评审模式）
3. `harness/plan.md` — 到 MVP 的 stage/step 追踪（唯一待办事实源）
4. `harness/memory.md` — 项目记忆（NEXT、当前状态、环境坑）
5. `docs/index.md` — 架构/验证/ADR/规格 索引（状态以 harness 为准）

## 硬边界（详见 harness/rules.md）

- 分层：`pages -> features -> domain -> infra -> shared`，领域逻辑不进页面。
- 页面层禁止直接 `wx.cloud.callFunction`；UI 不接触 AI 提供方原生字段。
- 客户端不保存任何密钥；不声明未实现的安全能力。
- UI 像素契约：`reference/陷空山UX设计/{home,chat,design-system}.html`。

## 验证

```bash
npm run verify # typecheck + lint + test + build:weapp
```

没有验证，就没有完成。
