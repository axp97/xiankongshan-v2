# 云函数（微信云开发 BFF）

两只云函数，是 UI 与 AI/身份之间唯一的边界（ADR-003）。DeepSeek 密钥只存服务端，绝不进客户端。

| 函数 | 职责 | 依赖 |
| --- | --- | --- |
| `aiGateway` | 隔离 DeepSeek 协议，返回归一化 `ChatReply`；服务端高危兜底判定；输入/输出内容安全检测 | `wx-server-sdk` |
| `login` | 由 openid 派生稳定假名 `anonymousId`（当前不用于鉴权、限流或画像） | `wx-server-sdk` |

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

- 云开发控制台测试没有 openid。普通消息应返回 `{ error: "SEC_UNAVAILABLE" }`，不得调用模型。高危关键词仍直接返回 `{ riskLevel: "high" }`。正常回复、拦截和检测通过要在有 openid 的真机上验证。
- 入参超过 2500 个 UTF-16 单元时返回 `{ error: "INPUT_TOO_LONG" }`，不调用模型。
- 真机/模拟器发消息，UI 收到归一化 `ChatReply`，high 时展示安全卡。
- 内容安全：真机发一条明显违规文本（如涉政辱骂类测试语），应收到温和拦截回复且不调模型。日志出现 `unavailable` 即这次检测没有当成通过。

## 内容安全（security.msgSecCheck）

- 对**用户输入**与 **AI 输出**各检一次。权限在 `aiGateway/config.json` 的 `permissions.openapi`。检测整段文本，不再截断后把未检测的部分外发或展示。
- 结果只有三态：`pass` 继续；`blocked` 用已审定文案（输入是温和拦截，输出是兜底句，风险级保留）；`unavailable` 时输入不调用模型，输出整段换成兜底句。
- 无 openid、调用异常、缺 `result` 都是 `unavailable`。控制台测试没有 openid，不能代表真机检测。
- 检测顺序：高危兜底 **先于** 内容安全。危机表达进安全协议，不先被审核拦住。
- 单条上限 2500 个 UTF-16 单元，云函数是权威校验。超出返回 `INPUT_TOO_LONG`。

## 提供方错误（R2）

模型调用失败不返回 `ChatReply`。稳定错误码：

- `PROVIDER_AUTH`：401 / 403
- `PROVIDER_RATE_LIMIT`：429
- `PROVIDER_UPSTREAM`：其他非 2xx、超时、连接中断
- `PROVIDER_SHAPE`：空 choices、非法 JSON、未知 riskLevel、字段类型不对
- `EMPTY` / `NO_KEY`：空输入 / 未配置密钥，含义不变

这些码在客户端是可重试的网关错误，不会显示成正常陪伴回复，也不会解除已有 high。日志只记错误码或 `errMsg`，不记响应正文。

## 安全边界

- 高危检测在服务端且不依赖模型可用性：命中现有关键词表时直接返回 `high`；未覆盖表达仍需模型判级与安全评测。
- 内容安全不再 fail-open。检测不可用时，输入不会送给模型，输出不会展示未检测正文。
- `anonymousId` 为 SHA-256 派生的稳定假名，服务端不落库、不建画像，当前 `aiGateway` 不读取该字段；F4 需决定删除最小化或按真实用途重建。
