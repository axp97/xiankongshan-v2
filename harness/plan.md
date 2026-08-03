# 陷空山 V2 · MVP（第一个生产版本）执行追踪

> 目标：把已跑通的"架构 + 真 AI"推进到**可对外的第一个生产版本**（体验版内测即可对外受邀使用）。
> 术语对齐 `docs/adr/ADR-004`：这里的 MVP = 产品 MVP（阶段 2），非架构验证切片。
> 优先级：**P0 = 发布阻断 / 质量红线**，**P1 = 发布必需非阻断**，**P2 = 上线后增量**。
> 负责方：`我` = 可在仓库内完成；`你` = 需在微信/云侧办理。

## Stage A · 架构与真 AI（已完成 ✅）

- [x] Taro4+React+TS 分层底座（pages/features/domain/infra/shared）
- [x] `aiGateway` 端口 + stub/cloud 双适配 + 工厂按环境切换
- [x] 接入 DeepSeek，`ChatReply` 归一化，密钥只在云端
- [x] 服务端高危兜底（不依赖模型可用性）→ 让位安全协议
- [x] `login` 匿名 `anonymousId` 单向派生
- [x] 反依赖四层（纯函数 + 单测）、四套时段主题
- [x] H5 / weapp 双端构建通过；typecheck / lint / test 全绿

## Stage B · UI 保真还原（P0 质量）— 负责：我 ✅

> 契约：`reference/陷空山UX设计/{home,chat,design-system}.html`

- [x] **B1** monoline SVG 图标集（`shared/ui/icons.ts` + `Icon.tsx`）
- [x] **B2** 关键组件形态（发送键/叶子 meta/思考气泡/nudge）
- [x] **B3** 状态与微交互（聚焦环 / risk-active 抑制 / 按压）
- [x] **B4** 排版/间距/圆角按设计标注对齐（stream 20px、气泡 gap 18、meta 11px 等）
- [x] **B5** 时段主题：深夜 palette 对齐 chat.html（ai-bubble `#16291F`、send→sage、risk-line `.95`）
- [x] **B6** 多视口防溢出（overflow-x / word-break / secondary-row flex）

## Stage C · 安全与合规底线（P0）— 代码侧 ✅

- [x] **C1** `security.msgSecCheck` 双向检测（生效需你重部署 aiGateway）
- [x] **C2** 危机文案对齐 §5/§6 + chat.html（强调句加粗、无热线、无诊断）— 非必须人工确认已后置
- [x] **C3** 隐私草案 `docs/privacy-guideline.md` + 应用内五项信任说明（含「不用于训练」）— 后台填报待你
- [x] **C4** 云环境 ID 可配置：`.env.example` → `TARO_APP_CLOUD_ENV`（`src/app.ts`）；未填则用开发者工具当前环境

## Stage D · 发布准备与内测（P1）

- [ ] **D1** 云函数部署 + `DEEPSEEK_API_KEY`（`cloudfunctions/README.md`）— **P0 人工**
- [ ] **D2** 体验版上传 + 真机冒烟（`harness/checklists/mvp-smoke.md`）— **P0 人工**
- [ ] **D3** 公开上架合规（企业主体 + 类目 + AIGC 备案）— 非内测必需，后置
- [x] **D4** 冒烟 checklist 已落

## Stage E · 上线后增量（P2，非 MVP）

- [ ] **E1** opt-in 本地会话留存（`docs/adr/ADR-005`）
- [ ] **E2** 可观测性
- [ ] **E3** 反依赖四层真实数据打磨

## 仓库侧结论

**代码侧生产 MVP（体验版目标）已就绪。** 剩余仅微信/云侧人工步骤，见文末「人工清单」。

## 人工清单（非必须确认已后置；下列为真正卡顿项）

### P0 · 不办则无法真机内测

1. 开通云开发，部署 `login` + `aiGateway`，配置 `DEEPSEEK_API_KEY`（必要时填 `.env` 的 `TARO_APP_CLOUD_ENV`）
2. 重新部署含 msgSecCheck 的 `aiGateway`（C1 生效）
3. 上传体验版，按 `harness/checklists/mvp-smoke.md` 真机勾选

### 可后置（不挡体验版）

- 审阅危机文案 / 隐私指引措辞（已按契约落地，仅后台申报时再贴）
- 公开上架：主体、类目、生成式 AI 备案（D3）
- B 档视觉在真机上的微调（数值已对齐契约）
