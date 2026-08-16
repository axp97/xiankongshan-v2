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

## Stage B7 · UI 规范沉淀 + weapp 运行时保真（P0 质量）— 负责：我 ✅

> 规格唯一源：`src/shared/ui/spec.ts`（B8-4 自 domain/ui 迁入）；纪律：`harness/rules.md` §9；护栏：`spec.test.ts` 三向交叉（spec ⇔ 契约 HTML ⇔ 实现 scss）常绿。

- [x] **B7-1** 规格沉淀：BASE_TOKENS / 四时段 PALETTES / GEOMETRY，逐字取自契约
- [x] **B7-2** TDD 三向交叉护栏（19 测试，先红后绿）+ colorTokens 行为测试
- [x] **B7-3** 根 token 经 mixin 双发 `:root`+`page`（根因：WXSS 不识 `:root`，真机圆角/阴影/品牌色全失效）
- [x] **B7-4** Icon 双端：weapp `<image>`+烤色 data-uri（根因：WXSS 不支持 `mask-image`，真机实心方块）；H5 保持 mask
- [x] **B7-5** 数值对齐：shadow-soft 8/24/.05、op-line 8、nudge 16、slow-hint 30ch、send 基础态绿（删 armed 反转）、TrustSheet 五处
- [x] **B7-6** placeholder 双端：`placeholderStyle`（weapp）+ `::placeholder`（H5）

## Stage B8 · 真机截图二轮评审收敛（P0 质量）— 负责：我 ✅

> 输入：用户真机截图（home 输入黑字 / chat 横向裁切）。护栏：spec.test.ts 扩收新断言。

- [x] **B8-1** chat 横向裁切：恢复契约 `.stream` flex+gap+`.msg` 84%/align-self；横向 padding 移 `.stream-inner`（weapp scroll-view 吃自身 padding）
- [x] **B8-2** textarea 文本样式 weapp 不生效（`.taro-textarea` 仅 H5）→ 挂组件节点 `.say`/`.input`（field-ink 黑字修复）
- [x] **B8-3** 主题收敛两套 day/night（morning≡day 冗余、evening 退役）；契约四套沉淀保留在 spec PALETTES
- [x] **B8-4** spec 扩收 textareaColor/streamInner/msgMaxWidth 护栏；spec 移 `shared/ui`（分层收敛，消 shared→domain 反依赖）

## Stage B9 · 提交前收敛轮（P0 质量）— 负责：我 ✅

- [x] **B9-1** composer 单行收敛：输入区与发送键等高 `var(--tap)`、文本垂直居中；多行仍贴底对齐（spec 护栏 `composerInputMinHeight/Padding`）
- [x] **B9-2** 全页终扫：`npm run verify` 全绿，spec 护栏 19/19 常绿；仓库侧 UI 达可提交状态

## Stage C · 安全与合规底线（P0）— 代码侧 ✅

- [x] **C1** `security.msgSecCheck` 双向检测（生效需你重部署 aiGateway）
- [x] **C2** 危机文案对齐 §5/§6 + chat.html（强调句加粗、无热线、无诊断）— 非必须人工确认已后置
- [x] **C3** 隐私草案 `docs/privacy-guideline.md` + 应用内五项信任说明（含「不用于训练」）— 后台填报待你
- [x] **C4** 云环境 ID 可配置：`.env.example` → `TARO_APP_CLOUD_ENV`（`src/app.ts`）；未填则用开发者工具当前环境

## Stage D · 发布准备与内测（P1）

- [~] **D1** 云函数部署 + `DEEPSEEK_API_KEY`（`cloudfunctions/README.md`）- **P0 人工**
  - 进展（2026-08-08）：开发者工具可跑通；**真机 `callFunction` 失败**（错误卡触发，截图已验）。强烈疑似未「上传并部署到云端」或环境不匹配（开发者工具本地调试可绕过部署）。`cloudGateway.ts` 已加诊断日志区分四类原因（未部署/环境不匹配 vs NO_KEY/PROVIDER）。**待确认**：云开发面板两函数部署状态 + `aiGateway` 环境变量 `DEEPSEEK_API_KEY`。
- [ ] **D2** 体验版上传 + 真机冒烟（`harness/checklists/mvp-smoke.md`）- **P0 人工**
  - 进展（2026-08-08）：**真机 UI 已验全对**（home/chat 双页渲染、错误卡逐字对齐契约）；主路径被云侧失败阻断。开发者工具 ≠ 真机：msgSecCheck（C1）在工具内因无 openid 会 skip（`aiGateway/index.js:28` warn），时段主题真机显色、体验版分发隔离（B5）、安全卡真实触发均须真机验。B7/B8 两轮修的恰是真机才暴露的坑。
- [ ] **D3** 公开上架合规（企业主体 + 类目 + AIGC 备案）- 非内测必需，后置
- [x] **D4** 冒烟 checklist 已落

## Stage E · 上线后增量（P2，非 MVP）

- [ ] **E1** opt-in 本地会话留存（`docs/adr/ADR-005`）
- [ ] **E2** 可观测性
- [ ] **E3** 反依赖四层真实数据打磨

## 仓库侧结论

**代码侧生产 MVP（体验版目标）已就绪。** 剩余仅微信/云侧人工步骤，见文末「人工清单」。

### 工程卫生（非 plan 立项，留痕）

- **README v2**（2026-08-16）：按面试战略 E 清单重设计——定位一句 + 分层图 + harness 亮点 + 真机截图（`docs/screenshots/`，含命名与替换约定）+ prompt 红线节 + onboarding（`project.config.example.json` 复制填 AppID）。简历四锚点（AI 陪伴小程序 / prompt 红线设计 / aiGateway / spec 护栏测试）全部在 README 可见、可点、可验。
- **riskState.test.ts**（2026-08-16）：客户端风险状态机单测（high 让位 / transition 复位 / 常态 normal），补齐「风险四档」测试证据。
- **全架构评审两轮**（2026-08-16）：第 1 轮简历叙事⇔实物对账，四锚点齐备；第 2 轮全维度扫查——边界/类型/隐私/文档一致性无红旗（存储写入仅 anonId+节律、无对话内容；`.cursor`/CLAUDE.md 纯指针一致），唯一盲点 riskState 已补测。**删项：无**（无死文件）。**人工余项**：GitHub About description（本机 gh 未登录），建议值见会话。
- **track 链路评审**：经评估**不接入**（2026-08-08）。E2 属 P2 非 MVP；隐私契约已申报「无第三方统计追踪」且 `app.ts` 主动 `traceUser: false`；当前瓶颈在 P0 人工项。将来若接须走方案 B（仅脱敏运维指标、不记对话原文）+ 同步改隐私指引 + 立 plan 项。详见 `harness/memory.md` NEXT。下个窗口勿重开。

## 人工清单（非必须确认已后置；下列为真正卡顿项）

### P0 · 不办则无法真机内测

1. 开通云开发，部署 `login` + `aiGateway`，配置 `DEEPSEEK_API_KEY`（必要时填 `.env` 的 `TARO_APP_CLOUD_ENV`）
2. 重新部署含 msgSecCheck 的 `aiGateway`（C1 生效）
3. 上传体验版，按 `harness/checklists/mvp-smoke.md` 真机勾选

### 可后置（不挡体验版）

- 审阅危机文案 / 隐私指引措辞（已按契约落地，仅后台申报时再贴）
- 公开上架：主体、类目、生成式 AI 备案（D3）
- B 档视觉在真机上的微调（数值已对齐契约）
