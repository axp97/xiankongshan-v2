// 1.6px 级细线 monoline 图标集，逐一取自设计契约 reference/陷空山UX设计/{home,chat}.html。
// 以 CSS mask 渲染（见 Icon.tsx）：mask 只取 alpha 通道，路径颜色统一写 #000，
// 实际颜色由使用方传入（支持 var(--token)，随时段主题自动变化）。
export const ICONS = {
  /** 纸飞机 · 首页发送键（home.html .send） */
  sendHome:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none"><path d="M2.5 8.5 14.5 3l-3.6 12-2.8-5.2L2.5 8.5Z" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  /** 纸飞机 · 会话发送键（chat.html .send） */
  send:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path d="M3 10 17 3l-4.2 14L9.5 11 3 10Z" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  /** 微光 · 起头词「今天有点累」 */
  spark:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2" stroke="#000" stroke-width="1.3" stroke-linecap="round"/><circle cx="7.5" cy="7.5" r="2.4" stroke="#000" stroke-width="1.3"/></svg>',
  /** 月亮 · 起头词「睡不着」 */
  moon:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none"><path d="M11.5 8.4A4.5 4.5 0 1 1 6.6 3.5a3.6 3.6 0 0 0 4.9 4.9Z" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  /** 委屈脸 · 起头词「有点委屈」 */
  frown:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.6" stroke="#000" stroke-width="1.3"/><path d="M5.2 9.2a3 3 0 0 1 4.6 0" stroke="#000" stroke-width="1.3" stroke-linecap="round"/><path d="M5.3 5.8h.01M9.7 5.8h.01" stroke="#000" stroke-width="1.6" stroke-linecap="round"/></svg>',
  /** 文本行 · 起头词「不想说话」 */
  lines:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none"><path d="M2.5 4.5h10M2.5 7.5h7M2.5 10.5h4" stroke="#000" stroke-width="1.3" stroke-linecap="round"/></svg>',
  /** 树洞灯 · 树洞提示 */
  treehole:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.5 2 3.5 3.9 3.5 6.4c0 1.6.8 2.9 2.1 3.7.3.2.4.4.4.7v.6c0 .4.3.8.8.8h2.4c.5 0 .8-.4.8-.8v-.6c0-.3.1-.5.4-.7 1.3-.8 2.1-2.1 2.1-3.7C12.5 3.9 10.5 2 8 2Z" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/><circle cx="8" cy="6.6" r="1.5" stroke="#000" stroke-width="1.1"/></svg>',
  /** 盾 + 勾 · 隐私入口 */
  shieldCheck:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" fill="none"><path d="M6.5 1 2 2.8v3.3c0 2.8 1.9 4.6 4.5 5.6 2.6-1 4.5-2.8 4.5-5.6V2.8L6.5 1Z" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/><path d="M4.8 6.4 6 7.6l2.3-2.4" stroke="#000" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** 人 · 信任项「匿名使用」 */
  person:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="5.5" r="3" stroke="#000" stroke-width="1.3"/><path d="M3 14c0-2.8 2.5-4.5 5.5-4.5S14 11.2 14 14" stroke="#000" stroke-width="1.3" stroke-linecap="round"/></svg>',
  /** 锁 · 信任项「密钥只在服务端」 */
  lock:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none"><rect x="3" y="7" width="11" height="7.5" rx="1.6" stroke="#000" stroke-width="1.3"/><path d="M5.5 7V5a3 3 0 0 1 6 0v2" stroke="#000" stroke-width="1.3" stroke-linecap="round"/></svg>',
  /** 盾 · 信任项「非医疗」 */
  shield:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none"><path d="M8.5 2.5C5 4 3 4.3 3 4.3v4.4c0 3.3 2.4 5.3 5.5 6.3 3.1-1 5.5-3 5.5-6.3V4.3s-2-.3-5.5-1.8Z" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  /** 垃圾桶 · 信任项「可清除」/ 清除按钮 */
  trash:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none"><path d="M3.5 5h10M6 5V3.8c0-.5.4-.8.8-.8h3.4c.4 0 .8.3.8.8V5m1 0-.6 8.2c0 .5-.4.8-.9.8H5.5c-.5 0-.9-.3-.9-.8L4 5" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** 加号 · chip「继续聊」 */
  plus:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2v9" stroke="#000" stroke-width="1.3" stroke-linecap="round"/></svg>',
  /** 旋转 · chip「换个角度」 */
  rotate:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" fill="none"><path d="M2.5 8.5a4.5 4.5 0 1 1 1.3 2.6" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 8.5h2.4v2.4" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** 叶子 · AI 气泡 meta 标记（fill 型） */
  leaf:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.2c1.4 1.2 1.4 1.2 2.9 1.2 0 2.4-.9 4.4-2.9 5.4-2-1-2.9-3-2.9-5.4 1.5 0 1.5 0 2.9-1.2Z" fill="#000"/></svg>',
  /** 盾 + 感叹 · 风险卡头 */
  riskShield:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" fill="none"><path d="M9.5 2.5C6 4 4 4.3 4 4.3v5c0 3.5 2.6 5.6 5.5 6.7 2.9-1.1 5.5-3.2 5.5-6.7v-5s-2-.3-5.5-1.8Z" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.5 7v3" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.5" cy="12" r=".7" fill="#000"/></svg>',
  /** 警示三角 · 网络错误条 */
  warnTriangle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path d="M10 2 1.5 17h17L10 2Z" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 8v4M10 14.3v.2" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>',
  /** 时钟 · 慢提示 */
  clock:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#000" stroke-width="1.2"/><path d="M7.5 4.3v3.4l2.1 1.3" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg>'
} as const

export type IconName = keyof typeof ICONS
