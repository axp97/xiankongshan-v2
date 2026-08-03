import tseslint from 'typescript-eslint'

// 扁平配置，最小且够用：类型感知的 TS 规则 + 领域边界护栏（禁 any）。
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'config/**', '**/*.test.ts']
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn'
    }
  }
)
