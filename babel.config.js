// babel-preset-taro 统一处理 React + TypeScript 编译。
module.exports = {
  presets: [
    ['taro', { framework: 'react', ts: true, compiler: 'webpack5' }]
  ]
}
