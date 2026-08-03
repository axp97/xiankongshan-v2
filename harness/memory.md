# 项目记忆

> 跨会话的"当前事实"快照。只记状态与坑，不复述决策（决策在 `docs/adr/`）。
> 每次里程碑或踩坑后更新本文件；过期条目直接删除。

## NEXT（新窗口只看这里取任务）

**仓库侧产品 MVP 代码已完成。** 下一「我」可编码项：无（Stage E 为上线后增量，勿提前做）。

**P0 人工（卡真机内测，见 `harness/plan.md` 文末）**：

1. 部署 `login` / `aiGateway` + `DEEPSEEK_API_KEY`（可选 `.env` 填 `TARO_APP_CLOUD_ENV`）
2. 重部署 aiGateway 使 C1 msgSecCheck 生效
3. 上传体验版，跑 `harness/checklists/mvp-smoke.md`

用户说「往下」且无新环境 ID / 无新需求时：只提醒上述 P0 人工项，**不要**开做 Stage E，**不要**重开 ADR。

## 当前状态（2026-07-25）

- Stage A–C + D4：仓库侧完成；B4–B6 按设计契约数值对齐；C2/C4 代码闭环（确认类事项后置）。
- 信任 sheet 五项含「不用于训练」（对齐 product-definition §8 / home.html）。
- 云环境：`TARO_APP_CLOUD_ENV` 经 `.env` 注入；未填则用开发者工具当前环境。
- 内测 MVP 定义：个人号体验版即可；公开上架（D3）另册。

## 环境与构建的坑（已验证的事实）

- Taro CLI 缓存：`HOME="$(pwd)/.home"`（`verify.sh` 已处理）。
- `webpack@5.91.0` 钉死；`npm install --legacy-peer-deps`。
- Babel 三件套显式安装；Sass `@use`；`[contenthash:8]`。
- Textarea 内层需 `background: transparent !important`。
- `msgSecCheck` v2 需 openid：控制台测试会 skip，须真机验。
- `aiGateway` timeout 须 60s（`config.json` 已设）。

## 仓库卫生

- `open-design/` 已删；`reference/xiankongshan/` ignore；设计契约入库。
- `.env` ignore；模板 `.env.example`；密钥只在云函数环境变量。
