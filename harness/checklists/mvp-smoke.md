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
- [ ] 重新部署过含 msgSecCheck 的 `aiGateway`（C1 生效）；R2/R3 后须部署对应新版本

### B1-R · Gate R 返修回归（R1–R5 后、完整真机放行前）

> 故障注入可在隔离测试环境执行，须记录命令/结果；H5 stub 不能替代 weapp 云端证据。详细口径见 `docs/reviews/2026-11-16-production-readiness.md` §7。

- [ ] 普通 A 延迟、高危 B 先回、A 后回：A 不清除 B 的风险卡/风险状态
- [ ] high/transition 中点击旧「继续聊/换个角度」：普通陪聊内容不出现；延迟中的旧 followup 也不能落地
- [ ] A 失败后发送 B，再点 A 的重试：只重试 A，不串成 B，也不删除无关错误入口
- [ ] 慢请求重试：无双回复、双高危卡或重复有效逻辑请求
- [ ] 请求/followup 在途时清除：旧任务不复活；草稿和会话元状态按约定清理，可再聊
- [ ] 模拟 401/429/500、非法 JSON、未知 riskLevel：不显示普通成功回复，不把既有 high 降为 normal/transition
- [ ] 超限输入、无 OPENID、审核异常/缺 result：执行 R3 批准策略；超限不调用 DeepSeek，无截断检测后完整放行
- [ ] 输入、聚焦、开关 sheet 不增加 dayCount；真实第三次打开才出现频次提示
- [ ] high → transition → normal：反依赖提示按 R6 裁决保持应有豁免
- [ ] 空发送出现可见且可访问的 nudge；非空发送不残留提示

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
