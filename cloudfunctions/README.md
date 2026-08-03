# 云函数（微信云开发 BFF）

两只云函数，是 UI 与 AI/身份之间唯一的边界（ADR-003）。DeepSeek 密钥只存服务端，绝不进客户端。

| 函数 | 职责 | 依赖 |
| --- | --- | --- |
| `aiGateway` | 隔离 DeepSeek 协议，返回归一化 `ChatReply`；服务端高危兜底判定；输入/输出内容安全检测 | `wx-server-sdk` |
| `login` | 由 openid 单向派生匿名 `anonymousId`（不可反查） | `wx-server-sdk` |

## 环境变量（在云开发控制台为对应函数配置）

- `aiGateway`：`DEEPSEEK_API_KEY` = 你的 DeepSeek Key（必填）
- `login`：`ANON_SALT` = 任意长随机串（可选，用于派生盐）

## 部署步骤

1. 微信开发者工具打开本项目，开通「云开发」，记下环境 ID。
2. （可选）复制根目录 `.env.example` → `.env`，填写 `TARO_APP_CLOUD_ENV=你的环境ID`，再重新编译；留空则用开发者工具当前云环境。
3. 右键 `cloudfunctions/login` → 上传并部署（云端安装依赖）。
4. 右键 `cloudfunctions/aiGateway` → 上传并部署（含内容安全后须重部署）。
5. 在云开发控制台给 `aiGateway` 配置 `DEEPSEEK_API_KEY`，重新部署使其生效。
6. **aiGateway 超时时间设为 60 秒**（默认 3 秒会导致调 DeepSeek 时 `system error`）；可在 `config.json` 的 `timeout` 或控制台「版本与配置」中修改。

## 验证

- 云开发控制台「云函数 → aiGateway → 测试」，入参 `{"message":"今天有点累"}`，应返回 `{ content, riskLevel:"low|none", createdAt }`。
- 入参 `{"message":"我不想活了"}`，应返回 `{ riskLevel:"high" }`（不调用模型，服务端兜底）。
- 真机/模拟器发消息，UI 收到归一化 `ChatReply`，high 时展示安全卡。
- 内容安全：真机发一条明显违规文本（如涉政辱骂类测试语），应收到温和拦截回复且不调模型；日志无 `fail-open` 记录即链路正常。

## 内容安全（security.msgSecCheck）

- 对**用户输入**与 **AI 输出**各检一次；权限已在 `aiGateway/config.json` 的 `permissions.openapi` 声明，部署即生效，免费。
- 检测顺序：高危兜底 **先于** 内容安全——危机表达要进安全协议获得帮助，而不是被审核拦截。
- 命中违规：输入侧返回温和拦截语（不调模型）；输出侧替换为兜底陪伴语（风险级别保留）。
- **fail-open 策略**：检测服务不可用时放行并记 `console.error` 日志（内测期可用性优先）。公开上架前应复评是否改为 fail-closed。
- 控制台测试无 openid（msgSecCheck v2 必填），会跳过检测并记 warn——内容安全链路必须在真机/模拟器验证。

## 安全边界

- 高危检测在服务端且不依赖模型可用性：命中关键词直接返回 `high`。
- 内容安全双向检测：用户输入与模型输出都过 `msgSecCheck`，违规不出云函数。
- `anonymousId` 为 SHA-256 单向派生，服务端不落库、不建画像。
