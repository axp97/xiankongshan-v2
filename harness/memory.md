# 项目记忆

> 跨会话的"当前事实"快照。只记状态与坑，不复述决策（决策在 `docs/adr/`）。
> 每次里程碑或踩坑后更新本文件；过期条目直接删除。

## NEXT（新窗口只看这里取任务）

**仓库侧产品 MVP 代码已完成（含 B7 UI 规范沉淀与 weapp 运行时保真；spec.test.ts 三向护栏常绿；根目录 README 已补）。** 下一「我」可编码项：无（Stage E 为上线后增量，勿提前做）。改 UI 数值先改 `src/shared/ui/spec.ts`+测试（rules §9）。

**track 链路评审结论（2026-08-08）**：经评估**不接入**。理由：① 隐私契约已申报「无第三方统计追踪」(privacy-guideline §二) 且 `app.ts` 主动 `traceUser: false`；② E2 属 P2 非 MVP，memory 明确「不开做 Stage E」；③ 当前瓶颈在 P0 人工项而非可观测性。将来若接须走方案 B（仅脱敏运维指标、不记对话原文）+ 同步改隐私指引 + 立 plan 项，属产品决策。下个窗口勿重开此评估。

**P0 人工（卡真机内测，见 `harness/plan.md` Stage D）**：

- 进展（2026-08-08）：微信开发者工具模拟器主路径已通（发消息收回复 OK）。**但这不等于真机冒烟通过**。
- **D1 待确认**：云函数是否已「上传并部署到云端」（开发者工具本地调试可绕过部署）；`DEEPSEEK_API_KEY` 是否已配到云控制台环境变量。
- **D2 未做**：真机冒烟。开发者工具内 msgSecCheck（C1）因无 openid 会 skip（`aiGateway/index.js:28`），时段主题真机显色 / 体验版分发隔离 / 安全卡真实触发均须真机验。B7/B8 修的恰是真机才暴露的坑。
- 真机冒烟走 `harness/checklists/mvp-smoke.md` 逐项勾选；截图对本环境无效（模型不支持图片输入），结果用文字反馈。

**全权接管生效**（2026-08-08 授权，见 protocol §5.7）：能自主的一律自主（读截图比对契约、改诊断代码、跑验证、刷文档）；人工只保留云控制台物理不可达的最小清单（见下）。

用户说「往下」且无新环境 ID / 无新需求时：推进最小人工清单，**不要**开做 Stage E，**不要**重开 ADR，**不要**接 track 链路。

## 当前状态（2026-08-08）

- Stage A–C + D4 + **B7/B8/B9**：仓库侧完成，UI 达可提交状态；B9 收敛 composer 单行态（输入区与发送键等高、垂直居中）。
- **D1/D2 进展**：微信开发者工具模拟器主路径已通（2026-08-08 负责人反馈）；**真机截图已验 UI 全对**（home/chat 双页、错误卡形态与文案逐字对齐契约 chat.html:873）；但**真机 `callFunction` 失败**（错误卡路径触发），开发者工具 ≠ 真机，D1 部署待确认、D2 真机冒烟未做。
- **排障抓手**（2026-08-08 补）：`cloudGateway.ts` 两个失败分支已加 `console.error` 诊断日志（仅本地控制台，不含对话内容）。真机开调试/vConsole 或开发者工具 Console 可看到云侧真实 errMsg（未部署/环境不匹配/NO_KEY/PROVIDER 一目了然）。
- **README v2**（2026-08-16）：按面试战略 E 清单重设计（定位一句 + 分层图 + harness 亮点 + 真机截图 + description 建议）；真机截图入 `docs/screenshots/`（含替换约定）；简历锚点（prompt 红线 / aiGateway / spec 护栏 / harness）全部可见。同日新增 `riskState.test.ts` 补风险状态机护栏。两轮全架构评审结论见 plan 工程卫生。
- **UI 规格唯一源** `src/shared/ui/spec.ts`；改 UI 数值先改 spec+测试再改 scss（rules.md §9）。
- weapp 根 token 经 mixin 双发 `:root`+`page`；Icon weapp 走 `<image>` 烤色（H5 走 mask）。
- 信任 sheet 五项含「不用于训练」（对齐 product-definition §8 / home.html）。
- 云环境：`TARO_APP_CLOUD_ENV` 经 `.env` 注入；未填则用开发者工具当前环境。
- 内测 MVP 定义：个人号体验版即可；公开上架（D3）另册。

## 环境与构建的坑（已验证的事实）

- Taro CLI 缓存：`HOME="$(pwd)/.home"`（`verify.sh` 已处理）。
- `webpack@5.91.0` 钉死；`npm install --legacy-peer-deps`。
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
