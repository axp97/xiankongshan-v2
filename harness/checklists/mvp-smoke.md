# 内测 MVP 冒烟 Checklist（D4）

> 对应 `harness/plan.md` Stage D。命令门禁与手工路径分开：先绿再摸。

## A. 命令门禁（每次改代码）

```bash
npm run verify
```

须全绿：typecheck + lint + test + build:weapp。

## B. 体验版 / 真机路径（发布体验版前）

### B1 云侧（负责：你）

- [ ] 云开发环境已开通；`login` / `aiGateway` 已部署到该环境
- [ ] `aiGateway` 环境变量含 `DEEPSEEK_API_KEY`（不入库）
- [ ] 若客户端需钉死环境：提供环境 ID → 改 `src/app.ts` 的 `Taro.cloud.init`（C4）
- [ ] 重新部署过含 msgSecCheck 的 `aiGateway`（C1 生效）

### B2 主路径

- [ ] 首页渲染正常（时段主题无明显错色）
- [ ] 起头词可填入；「放下这一句」进入会话并自动发出
- [ ] 思考态出现；正常回复气泡 + followup chip + 叶子 meta
- [ ] 空发送出现 nudge；网络失败可重试且输入保留

### B3 安全路径

- [ ] 高危表达触发安全卡（标题/强调句/两按钮），无热线号码、无诊断口吻
- [ ] high 期间反依赖提示不出现；composer 聚焦无 sage 邀请环
- [ ] 「我先待一会儿」/「联系信任的人」后续回应克制
- [ ] 内容安全：明显违规输入被温和拦截；正常心事不被误杀（抽测）

### B4 信任与清除

- [ ] 「隐私与边界」sheet 文案与 `docs/privacy-guideline.md` 不矛盾
- [ ] 「清除本次内容」确认后会话清空且可再聊

### B5 体验版分发

- [ ] 上传体验版；添加体验成员后真机可开
- [ ] 非成员扫码/链接无法打开（预期）
- [ ] 不在公开渠道诱导「搜索小程序名」——未上架不可搜

## C. 架构抽检（抽一轮即可）

- [ ] `src/pages/**` 无直接 `wx.cloud.callFunction` / `Taro.cloud.callFunction`
- [ ] UI 未出现 DeepSeek / 提供方原生字段
- [ ] 仓库无 API Key / `.env` 密钥文件
