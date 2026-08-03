/// <reference types="@tarojs/taro" />

declare module '*.scss'
declare module '*.png'
declare module '*.svg'

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
    NODE_ENV: 'development' | 'production'
    /** 微信云开发环境 ID（见根目录 `.env.example`） */
    TARO_APP_CLOUD_ENV?: string
  }
}
