# 规格：阶段 1 最小聊天切片

> 口径澄清（见 `../adr/ADR-004-mvp-scope-alignment.md`）：本规格是**架构验证切片，不是产品 MVP**。产品 MVP 是 `product-definition.md` 契约，落在阶段 2。本规格刻意不做生产视觉、风险分级、历史留存。

## 1. 目标

验证陷空山 V2 的最小架构切片。

本规格不实现完整聊天产品。它只验证前端、基础设施客户端、云函数边界和 AI 响应归一化能够协同工作。

## 2. 用户路径

```text
打开小程序
-> 看到一个最小页面
-> 点击发送测试消息
-> 收到归一化回复
-> 渲染回复
```

## 3. 输入

前端输入：

```ts
type SendMessageInput = {
  content: string;
};
```

云函数输入：

```ts
type AiGatewayRequest = {
  message: string;
  anonymousId?: string;
};
```

## 4. 输出

前端输出：

```ts
type ChatReply = {
  id: string;
  content: string;
  riskLevel: "none" | "low" | "medium" | "high";
  createdAt: number;
};
```

错误输出：

```ts
type AppError = {
  code: string;
  message: string;
  retryable: boolean;
};
```

## 5. 约束

1. 页面文件不得直接调用 `wx.cloud.callFunction`。
2. AI 提供方原生字段不得到达 UI。
3. 领域类型不得使用 `any`。
4. 云端错误必须归一化。
5. 客户端不得保存 API 密钥。
6. 不声明端到端加密。
7. 不迁移旧页面。

## 6. 非目标

1. 不实现持久化聊天历史。
2. 不实现流式响应。
3. 不实现树洞。
4. 不实现设置页。
5. 不实现生产级危机干预流程。
6. 不实现多提供方路由。
7. 不实现生产级视觉设计。

## 7. 建议文件边界

```text
src/
├── pages/index/
├── features/chat/
├── domain/chat/
├── infra/ai/
├── infra/cloud/
└── shared/
```

## 8. 验收标准

1. 小程序可以在微信开发者工具中启动。
2. 最小页面可以渲染。
3. 可以发送测试消息。
4. UI 收到归一化后的 `ChatReply`。
5. 页面层不直接调用云函数协议。
6. TypeScript 严格模式通过。
7. 至少一个领域层单元测试通过。
8. 错误使用 `AppError`。
9. UI 中不出现提供方原生字段。
10. 不实现阶段 1 非目标。

## 9. 验证命令

项目初始化必须定义以下等价命令：

```bash
typecheck
lint
test
dev:weapp
```

## 10. 评审重点

评审者必须检查：

1. 架构边界。
2. 类型安全。
3. 提供方隔离。
4. 最小范围。
5. 冗余文件或抽象。
