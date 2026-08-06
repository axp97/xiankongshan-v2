# 项目记忆

> 跨会话的"当前事实"快照。只记状态与坑，不复述决策（决策在 `docs/adr/`）。
> 每次里程碑或踩坑后更新本文件；过期条目直接删除。

## NEXT（新窗口只看这里取任务）

**仓库侧产品 MVP 代码已完成（含 B7 UI 规范沉淀与 weapp 运行时保真；spec.test.ts 三向护栏常绿）。** 下一「我」可编码项：无（Stage E 为上线后增量，勿提前做）。改 UI 数值先改 `src/shared/ui/spec.ts`+测试（rules §9）。

**P0 人工（卡真机内测，见 `harness/plan.md` 文末）**：

1. 部署 `login` / `aiGateway` + `DEEPSEEK_API_KEY`（可选 `.env` 填 `TARO_APP_CLOUD_ENV`）
2. 重部署 aiGateway 使 C1 msgSecCheck 生效
3. 上传体验版，跑 `harness/checklists/mvp-smoke.md`

用户说「往下」且无新环境 ID / 无新需求时：只提醒上述 P0 人工项，**不要**开做 Stage E，**不要**重开 ADR。

## 当前状态（2026-08-06）

- Stage A–C + D4 + **B7/B8/B9**：仓库侧完成，UI 达可提交状态；B9 收敛 composer 单行态（输入区与发送键等高、垂直居中）。
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
- 本环境 IAB 浏览器自动化不可用（guest 反复 not attached）；视觉核对走真机冒烟。

## 仓库卫生

- `open-design/` 已删；`reference/xiankongshan/` ignore；设计契约入库。
- `.env` ignore；模板 `.env.example`；密钥只在云函数环境变量。
