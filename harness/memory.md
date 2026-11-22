# 项目记忆

> 跨会话的"当前事实"快照。只记状态与坑，不复述决策（决策在 `docs/adr/`）。
> 每次里程碑或踩坑后更新本文件；过期条目直接删除。

## NEXT（新窗口只看这里取任务）

**2026-11-16 状态重置：当前是体验版候选，不是“代码侧生产 MVP 已就绪”。** 第二轮生产可信度评审已落盘：`docs/reviews/2026-11-16-production-readiness.md`。R1–R5 已完成。

**本轮仓库代码在滚动收口后停止。** 这不是生产封板。下一步是「你」：R6 裁决 high 保持/退出、medium 最低内容、危机按钮真实承诺；D1 确认云环境并重新部署带 R2/R3 的 `aiGateway`。完整 D2 真机放行在这两项之后。不要提前做 F/E 的其余项，也不要自行改危机按钮文案。滚动漏跟已修：同一锚点值不会再次滚动，现每次先清空再指回底部。

**R 阶段顺序**：R1 请求生命周期（完成）→ R2 提供方错误（完成）→ R3 内容安全三态（完成）→ R4 反依赖（完成）→ R5 高危交互让位/空发送提示（完成）。Gate R 见评审 §7。R2/R3 改了云函数，真机生效前须重新部署 `aiGateway`。

**可并行「你」事项**：D1 确认云环境、两函数部署、密钥与版本；R6 裁决 high 保持/退出、medium 最低内容、危机按钮真实承诺及依赖措辞。完整 D2 真机放行必须在 R1–R5 后，风险协议需 R6；公开生产另有 F1–F4。

**不要**：重开 ADR；提前做 Stage E；把 H5 stub 当生产证据；把单测全绿或本地 ALL GREEN 当真机/云端安全证据。track 链路仍按 2026-08-08 结论不接第三方统计追踪；未来 F1 只允许经隐私评审的脱敏运维指标，不记对话原文。

**对话与变更约定（2026-11-16 负责人要求）**：每次输出开头说明当前链路、已做与剩余；每次更改前先总结串联方案并列出文件及各自作用，更改后提供界面验收分点。

## 当前状态（2026-11-16）

- **R1 仍有效**：`chatSession.ts` 持有会话代次。更晚的请求提交后，更早的 normal 不得改风险态；重试不串话；清除后旧任务不能写回。
- **R2 已落地**：`providerReply.js` 把非 2xx、空 choices、非法 JSON、未知 riskLevel、错误字段类型收成 `PROVIDER_AUTH` / `PROVIDER_RATE_LIMIT` / `PROVIDER_UPSTREAM` / `PROVIDER_SHAPE`。客户端 `parseChatReply` 不再把未知风险级补成 none。这类错误走错误卡，不解除已有 high。
- **R3 已落地**：内容安全只有 pass / blocked / unavailable。无 openid、异常、缺 result 不再放行；输入超 2500 个 UTF-16 单元不调用模型；输出未完整检测时整段换成兜底句。两端输入框有上限，聊天页到上限时给出提示。控制台测试没有 openid，普通消息会返回 `SEC_UNAVAILABLE`；高危关键词仍直接 high。
- **本地复验**：`npm run verify` 全绿（9 个测试文件、49 个测试 + weapp build）。`build:h5` 此前有 305 KiB 体积警告。依赖审计 23 项需可达性分诊，不等于线上漏洞，也不覆盖云函数依赖图。
- **R4 已落地**：善终同一会话只出现一次；high 与 transition 期间层一二三都静默。跨日关怀看 `priorHighDays`（今天之前连续达标的天数），不再把“连续打开”当成“连续高频”。本地记录字段类型不对就整份丢弃；旧数据没有这段历史时从 0 计。
- **R5 已落地**：high 与本会话过渡期隐藏并拒绝「继续聊 / 换个角度 / 我现在好一点了」；已经点下、尚未落地的普通 followup 在 high 或过渡时取消。安全卡的「联系一个我信任的人」「我先待一会儿」仍是原有文案，不拨号、不跳转。聊天页空内容时发送键可点，出现「还没写呢」。
- **仍开放的 P0**：R6 危机协议裁决，以及 D1 云部署确认。仓库内 R 阶段编码已完。
- **开发者工具主路径**：工具内 AI 曾能回话。R3 之后，没有 openid 的控制台测试不会再调用模型。真机 `callFunction` 曾失败的记录仍在，R2/R3 需要重新部署后才在云端生效。track 链路仍不接入。
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
- **cloudGateway 曾静默吞云侧错误**（`catch {}`）：2026-08-08 加了诊断日志；R2 起只记 `errMsg` 或稳定错误码，不打印整个异常对象和响应正文。真机失败先看它：未部署/环境不匹配（callFunction 失败）vs `NO_KEY` / `PROVIDER_*` / `SEC_UNAVAILABLE` / `INPUT_TOO_LONG`。
- **2026-11-21 模拟器云调用失败**：基础库 3.x（工具里是 3.16.2）不再提供 `process`。`TARO_APP_CLOUD_ENV` 没进 `.env` 时，打包会留下 `process.env.TARO_APP_CLOUD_ENV`，运行时抛 `process is not defined`，初始化中断。已在 `config/index.ts` 的 `defineConstants` 里把它收成编译期字符串。`useLaunch` 登记太晚的问题仍由 `ensureCloud()` 负责。界面上的「网络好像断了一下」是这次异常的统一文案，不是网络或模型故障。

## 仓库卫生

- `open-design/` 已删；`reference/xiankongshan/` ignore；设计契约入库。
- `.env` ignore；模板 `.env.example`；密钥只在云函数环境变量。
