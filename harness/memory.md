# 项目记忆

> 跨会话的"当前事实"快照。只记状态与坑，不复述决策（决策在 `docs/adr/`）。
> 每次里程碑或踩坑后更新本文件；过期条目直接删除。

## NEXT（新窗口只看这里取任务）

**2026-11-16 状态重置：当前是体验版候选，不是“代码侧生产 MVP 已就绪”。** 第二轮生产可信度评审已落盘：`docs/reviews/2026-11-16-production-readiness.md`；原“下一我可编码项：无 / 剩余仅人工”结论废止。

**下一「我」编码项：`harness/plan.md` Stage R1——会话请求代次、响应归属与清除边界。** 先处理 `useChat.ts` / `messages.ts` / `ChatView.tsx` 及行为测试：旧 normal 不得清除新 high；A/B 重试不串话；慢重试不双回；清除后旧网络/followup/timer 不得写回。不要直接跳到 UI 精修或 Stage F/E。

**R 阶段顺序**：R1 请求生命周期 → R2 提供方错误与契约 → R3 内容安全三态/长度 → R4 反依赖 → R5 高危交互让位/空发送提示。每项完成须 `npm run verify` + 对应故障注入/行为测试 + 勾选 plan + 刷新 memory。Gate R 界面验收见评审 §7 与冒烟 checklist。

**可并行「你」事项**：D1 确认云环境、两函数部署、密钥与版本；R6 裁决 high 保持/退出、medium 最低内容、危机按钮真实承诺及依赖措辞。完整 D2 真机放行必须在 R1–R5 后，风险协议需 R6；公开生产另有 F1–F4。

**不要**：重开 ADR；提前做 Stage E；把 H5 stub 当生产证据；把 23 个现有单测或本地 ALL GREEN 当真机/云端安全证据。track 链路仍按 2026-08-08 结论不接第三方统计追踪；未来 F1 只允许经隐私评审的脱敏运维指标，不记对话原文。

**对话与变更约定（2026-11-16 负责人要求）**：每次输出开头说明当前链路、已做与剩余；每次更改前先总结串联方案并列出文件及各自作用，更改后提供界面验收分点。

## 当前状态（2026-11-16）

- **第二轮评审与交接文档已入库**：新增 `docs/reviews/2026-11-16-production-readiness.md`；plan 新增 Stage R/F；README 状态改为体验版候选；隐私草案、云端 README 和冒烟清单同步校正。本轮仅文档变更，无产品 UI/运行时变更。
- **本地复验**：`npm run verify` 全绿（typecheck + lint + 4 文件 23 测试 + weapp build）；`build:h5` 通过但入口 305 KiB 有体积警告。依赖审计 23 项需可达性分诊，不等于 23 个线上漏洞，也不覆盖云函数独立依赖图。
- **已确认 P0**：旧响应可覆盖新 high；提供方 JSON 错误可伪装 normal；未知 riskLevel 向 none 降级；重试串话/双发；清除后旧任务复活；high 中旧 followup 绕过；render 虚增反依赖次数；2500 字后内容未审但仍外发/展示。详见评审 §4。
- **历史完成仍有效的是“代码分支/视觉契约已落地”，不是生产验收**：Stage A–C + D4 + B7/B8/B9 保留；UI 规格唯一源仍为 `src/shared/ui/spec.ts`，改数值先改 spec+测试。
- **真机证据边界**：2026-08-08 模拟器主路径曾通、真机首页/错误态 UI 曾验，但真机 `callFunction` 失败；当前云侧实况需在 D1 重新确认，正常回复、高危、审核、清除、分发均未形成完整真机通过记录。
- **隐私口径**：README/隐私草案已改为“本应用不自行训练/建服务端画像”，并披露 OPENID 也用于内容安全；应用内 TRUST 的绝对“不用于训练”仍须在 F4 根据第三方证据对齐。anonymousId 当前未被 aiGateway 使用。
- **诊断日志边界**：代码未显式打印正文，但 `cloudGateway.ts` 会记录完整异常对象，不能再绝对宣称“不含对话内容”；F1/F4 做白名单错误码与日志保留/访问核验。
- 云环境：`TARO_APP_CLOUD_ENV` 经 `.env` 注入；未填则用开发者工具当前环境。公开生产须在 F4 显式隔离并记录版本。
- 内测 MVP 定义：个人号体验版即可；公开上架（D3）须先完成 F1–F4。

## 环境与构建的坑（已验证的事实）

- Taro CLI 缓存：`HOME="$(pwd)/.home"`（`verify.sh` 已处理）。
- `webpack@5.91.0` 钉死；干净安装用 `npm ci --legacy-peer-deps`。
- 2026-11-16 当前 Node `22.12.0` 安装时出现 `eslint-visitor-keys@5.0.1` engine 警告（要求 `^22.13.0` 等）；F4 固定受支持 Node LTS 与云函数 lockfile。
- 默认 npmmirror 不支持 npm audit quick endpoint；本次审计显式使用 `--registry=https://registry.npmjs.org`。
- Babel 三件套显式安装；Sass `@use`；`[contenthash:8]`。
- Textarea 内层需 `background: transparent !important`。
- **WXSS 不识 `:root`**：根 token 须 `page` 双发（theme.scss mixin；spec.test.ts 护栏）。
- **WXSS 不支持 `mask-image`**：图标 weapp 走 `<image>`+烤色 data-uri（colorTokens.ts 解析 var）。
- weapp `::placeholder` 不生效：须 `placeholderStyle`（已双端）。
- **weapp scroll-view 吃自身横向 padding**：水平留白须内层 wrapper（`.stream-inner`；spec 护栏）。
- **Taro `.taro-textarea` 内层类仅 H5**：文本样式（color/font-size/line-height）须挂组件节点选择器。
- 主题生产收敛两套 day/night（`ACTIVE_THEMES`，22:00–05:00 暗）；契约四套沉淀在 spec PALETTES 不删。
- `msgSecCheck` v2 需 openid：控制台测试会 skip，须真机验。
- `aiGateway` timeout 须 60s（`config.json` 已设）。
- 本环境 IAB 浏览器自动化不可用（guest 反复 not attached）；但**截图可读**（2026-08-08 起），视觉核对可走「真机截图 + AI 比对契约」。
- **cloudGateway 曾静默吞云侧错误**（`catch {}`）：真机失败无法区分原因；2026-08-08 已加 `[aiGateway]` 诊断日志。真机失败先看它：未部署/环境不匹配（callFunction 失败）vs NO_KEY/PROVIDER（回应不可归一化）。

## 仓库卫生

- `open-design/` 已删；`reference/xiankongshan/` ignore；设计契约入库。
- `.env` ignore；模板 `.env.example`；密钥只在云函数环境变量。
