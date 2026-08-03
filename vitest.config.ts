import { defineConfig } from 'vitest/config'
import path from 'node:path'

// 领域层是无框架纯 TS，vitest 直跑；仅需 @ 别名与 domain/shared 测试范围。
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    include: ['src/**/*.test.ts']
  }
})
