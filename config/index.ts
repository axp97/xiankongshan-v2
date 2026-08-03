import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'node:path'

// 单一 Taro 配置：dev/prod 差异通过 mode 分支内联，避免 config/dev.ts、config/prod.ts 冗余文件。
export default defineConfig<'webpack5'>(async (merge, { mode }) => {
  const isProd = mode === 'production'

  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'xiankongshan-v2',
    date: '2026-7-6',
    // 设计稿以 375 逻辑宽度标定（iOS 基准），px 直接书写。
    designWidth: 375,
    deviceRatio: { 375: 2 / 1, 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
    sourceRoot: 'src',
    outputRoot: `dist/${process.env.TARO_ENV}`,
    plugins: [],
    defineConstants: {},
    alias: { '@': path.resolve(__dirname, '..', 'src') },
    copy: { patterns: [], options: {} },
    framework: 'react',
    compiler: { type: 'webpack5', prebundle: { enable: false } },
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: { enable: true, config: {} },
        cssModules: { enable: false }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      postcss: {
        autoprefixer: { enable: true },
        cssModules: { enable: false }
      }
    }
  }

  return merge({}, baseConfig, {
    mini: { minifyXML: { collapseWhitespace: isProd } },
    h5: { devServer: { host: 'localhost' } }
  })
})
