# ADR-002：Taro + React + TypeScript 前端技术栈

## 状态

已接受，等待项目创建。

## 背景

负责人具备 React、Vue 和 React Native 经验。目标平台初期是微信小程序，未来可能扩展到多端。

Uni-app 更适合 Vue 取向团队。对于 React 取向架构，Taro 更匹配。

## 决策

V2 使用：

1. Taro 4。
2. React。
3. TypeScript 严格模式。

准确的 React 版本以项目初始化时稳定的 Taro 模板为准。

## 未决事项

阶段 1 不要求：

1. React 19。
2. Tailwind CSS v4。
3. Turborepo。
4. Bun。
5. Biome。
6. 完整 monorepo 包抽取。

这些事项可在阶段 1 之后重新评估。

## 影响

正向影响：

1. 复用现有 React 知识。
2. 让小程序开发更接近现代前端架构。
3. 保留未来多端扩展的选择权。

负向影响：

1. 部分小程序平台细节仍需通过适配器处理。
2. 前沿 React 特性可能受到生态兼容性的滞后影响。

## 验证

阶段 1 必须证明所选技术栈可以启动、渲染、通过类型检查，并完成一次云端支撑的交互。
