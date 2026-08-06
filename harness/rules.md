# 陷空山 V2 工程规则

## 1. 权威性

本文件是陷空山 V2 的最高工程规则。

如果文档之间存在冲突，按以下顺序执行：

1. `harness/rules.md`
2. `docs/architecture.md`
3. `docs/verification.md`
4. 当前生效规格
5. 现有实现

## 2. 项目定位

- V2 是一次全新重写。
- 旧项目只作为业务参考和应急回退方案。
- 阶段 1 验证通过后，新的产品开发在 V2 中进行。

## 3. 必选技术栈

- Taro 4。
- React。
- TypeScript 严格模式。
- 微信云开发作为 BFF。
- AI 访问统一经过 `aiGateway`。

准确的 React 版本以项目初始化时稳定的 Taro 模板为准。

## 4. 架构边界

- 页面只处理渲染、生命周期和用户交互。
- 领域逻辑不得嵌入页面文件。
- 微信 API 必须隔离在基础设施适配器中。
- AI 提供方协议必须隔离在 `aiGateway` 之后。
- UI 只能消费应用层类型。

## 5. 禁止事项

- 页面层直接调用 `wx.cloud.callFunction`。
- UI 中出现 AI 提供方原生字段。
- 客户端保存 API 密钥。
- 领域边界之间使用 `any`。
- 未经验证的安全声明。
- 超出当前生效规格的功能扩展。
- 缺少架构必要性的冗余文件或抽象。

## 6. 执行器规则

每个实现任务都必须有：目标、输入、输出、约束、非目标、验收标准、验证命令。

跨会话强制：

1. 新窗口必须先执行根目录 `AGENTS.md` 冷启动协议。
2. 待办只认 `harness/plan.md`；进度与 NEXT 只认 `harness/memory.md`。
3. 完成一项必须：`npm run verify` + 勾选 plan + 刷新 memory（见 `harness/protocol.md` §7）。
4. 禁止重开 `docs/adr/` 已裁决问题；禁止在「待真机/待你确认」项上盲改。

没有验证，就没有完成。

## 7. 最小验证要求

每个阶段都必须定义以下事项的等价命令：

- Typecheck。
- Lint。
- 单元测试。
- 运行时冒烟检查。

## 8. 评审门禁

如果一项变更存在以下情况，则不能通过评审：

1. 破坏架构边界。
2. 添加未经批准的依赖。
3. 引入无类型约束的领域行为。
4. 与文档相矛盾。
5. 静默扩展范围。
6. 声明未实现的安全行为。

## 9. UI 规格纪律

`src/shared/ui/spec.ts` 是 UI 数值（token / 几何 / 字阶 / 时段 palette）的唯一源，逐字沉淀自 `reference/陷空山UX设计/` 契约。

1. 改 UI 数值须**先改 spec 与 `spec.test.ts`，再改 scss**；禁止绕过 spec 直改样式数值。
2. 根 token 在 theme.scss 须经 mixin 双发 `:root`（H5）与 `page`（weapp）——WXSS 不识别 `:root`。
3. 图标在 weapp 须走 `<image>` + 烤色 data-uri（WXSS 不支持 `mask-image`）；H5 走 mask。
4. `spec.test.ts` 三向交叉断言（spec ⇔ 契约 HTML ⇔ 实现 scss）必须常绿；红即阻断合并。
