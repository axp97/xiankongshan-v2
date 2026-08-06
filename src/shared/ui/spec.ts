// 陷空山 V2 · UI 规格唯一源（机器可读设计契约）。
// 值逐字沉淀自 reference/陷空山UX设计/{design-system,home,chat}.html。
// 改 UI 数值的唯一合法路径：先改本文件与 spec.test.ts，再改 scss（harness/rules.md §9）。
// spec.test.ts 三向交叉断言：spec ⇔ 契约 HTML ⇔ 实现 scss，防沉淀漂移与实现写飘。

/** 时段无关基础 token（design-system.html §01–§03 + chat.html :root） */
export const BASE_TOKENS = {
  sage: '#6FA37A',
  deep: '#2F6B4F',
  deepPress: '#27593F',
  notice: '#B9894B',
  danger: '#B85C5C',
  soft: '#EEF5EE',
  lineSoft: '#EDF2ED',
  noticeWash: '#F5EEE0',
  sageWash: 'rgba(111,163,122,0.1)',
  sageWash2: 'rgba(111,163,122,0.16)',
  rCard: '8px',
  rField: '16px',
  rBubble: '14px',
  rPill: '999px',
  tap: '48px',
  // chat.html :root 值（home.html 未定义 shadow-soft；气泡阴影以 chat 为准）
  shadowSoft: '0 1px 2px rgba(23,35,29,0.04), 0 8px 24px rgba(23,35,29,0.05)',
  // home.html :root 值
  shadowInput: '0 2px 4px rgba(23,35,29,0.03), 0 16px 40px rgba(23,35,29,0.07)',
  ease: 'cubic-bezier(0.2,0.7,0.2,1)'
} as const

export type BaseTokenName = keyof typeof BASE_TOKENS

/** 时段语义 palette（chat.html JS `TOD` 表逐字沉淀，23 变量 × 4 时段） */
export const PALETTES = {
  morning: {
    canvas: '#F7FAF6',
    fieldBg: '#FFFFFF',
    fieldLine: '#E2EAE2',
    titleInk: '#17231D',
    subInk: '#66756A',
    fieldInk: '#17231D',
    placeholder: '#A6B2A9',
    userBubble: '#EEF5EE',
    userBubbleInk: '#17231D',
    aiBubble: '#FFFFFF',
    aiBubbleLine: '#E2EAE2',
    aiBubbleInk: '#17231D',
    chipBg: '#FFFFFF',
    chipLine: '#E2EAE2',
    chipInk: '#3C4A41',
    anonBg: 'rgba(111,163,122,0.1)',
    anonInk: '#66756A',
    sendBg: '#2F6B4F',
    sendBgPress: '#27593F',
    sendDisabled: '#C3D2C6',
    footInk: '#66756A',
    statusbarInk: '#17231D',
    riskLineOpacity: '0.7'
  },
  day: {
    canvas: '#F7FAF6',
    fieldBg: '#FFFFFF',
    fieldLine: '#E2EAE2',
    titleInk: '#17231D',
    subInk: '#66756A',
    fieldInk: '#17231D',
    placeholder: '#A6B2A9',
    userBubble: '#EEF5EE',
    userBubbleInk: '#17231D',
    aiBubble: '#FFFFFF',
    aiBubbleLine: '#E2EAE2',
    aiBubbleInk: '#17231D',
    chipBg: '#FFFFFF',
    chipLine: '#E2EAE2',
    chipInk: '#3C4A41',
    anonBg: 'rgba(111,163,122,0.1)',
    anonInk: '#66756A',
    sendBg: '#2F6B4F',
    sendBgPress: '#27593F',
    sendDisabled: '#C3D2C6',
    footInk: '#66756A',
    statusbarInk: '#17231D',
    riskLineOpacity: '0.7'
  },
  evening: {
    canvas: '#EEF2EC',
    fieldBg: '#FFFFFF',
    fieldLine: '#DDE5DC',
    titleInk: '#17231D',
    subInk: '#5A6960',
    fieldInk: '#17231D',
    placeholder: '#9AA69D',
    userBubble: '#E5EDE3',
    userBubbleInk: '#17231D',
    aiBubble: '#FFFFFF',
    aiBubbleLine: '#DDE5DC',
    aiBubbleInk: '#17231D',
    chipBg: '#FFFFFF',
    chipLine: '#DDE5DC',
    chipInk: '#3C4A41',
    anonBg: 'rgba(47,107,79,0.12)',
    anonInk: '#5A6960',
    sendBg: '#2F6B4F',
    sendBgPress: '#27593F',
    sendDisabled: '#B8C8BC',
    footInk: '#5A6960',
    statusbarInk: '#17231D',
    riskLineOpacity: '0.8'
  },
  night: {
    canvas: '#10221B',
    fieldBg: '#16291F',
    fieldLine: 'rgba(255,255,255,0.1)',
    titleInk: '#EAF1EB',
    subInk: '#9DB3A4',
    fieldInk: '#EAF1EB',
    placeholder: '#6E8576',
    userBubble: 'rgba(255,255,255,0.06)',
    userBubbleInk: '#EAF1EB',
    aiBubble: '#16291F',
    aiBubbleLine: 'rgba(255,255,255,0.1)',
    aiBubbleInk: '#EAF1EB',
    chipBg: 'rgba(255,255,255,0.05)',
    chipLine: 'rgba(255,255,255,0.12)',
    chipInk: '#CADCCF',
    anonBg: 'rgba(111,163,122,0.16)',
    anonInk: '#9DB3A4',
    sendBg: '#6FA37A',
    sendBgPress: '#5E8E6A',
    sendDisabled: '#3A4A40',
    footInk: '#8AA193',
    statusbarInk: '#EAF1EB',
    riskLineOpacity: '0.95'
  }
} as const

export type TimeOfDayKey = keyof typeof PALETTES

/** 生产启用的主题子集（契约沉淀四套，产品收敛两套：亮=day / 暗=night）。
 *  morning 与 day 契约值完全相同（冗余），evening 差异微弱且真机验证面大——
 *  专家裁决收敛两套，降低 weapp 风险面（2026-08-06）。 */
export const ACTIVE_THEMES = ['day', 'night'] as const
export type ThemeKey = (typeof ACTIVE_THEMES)[number]
export type PaletteTokenName = keyof (typeof PALETTES)['day']

/** CSS 变量名映射（spec key → --kebab-name），供 theme.scss 交叉断言 */
export const PALETTE_CSS_NAME: Record<PaletteTokenName, string> = {
  canvas: '--canvas',
  fieldBg: '--field-bg',
  fieldLine: '--field-line',
  titleInk: '--title-ink',
  subInk: '--sub-ink',
  fieldInk: '--field-ink',
  placeholder: '--placeholder',
  userBubble: '--user-bubble',
  userBubbleInk: '--user-bubble-ink',
  aiBubble: '--ai-bubble',
  aiBubbleLine: '--ai-bubble-line',
  aiBubbleInk: '--ai-bubble-ink',
  chipBg: '--chip-bg',
  chipLine: '--chip-line',
  chipInk: '--chip-ink',
  anonBg: '--anon-bg',
  anonInk: '--anon-ink',
  sendBg: '--send-bg',
  sendBgPress: '--send-bg-press',
  sendDisabled: '--send-disabled',
  footInk: '--foot-ink',
  statusbarInk: '--statusbar-ink',
  riskLineOpacity: '--risk-line-opacity'
}

/** 组件几何/字阶规格（home.html / chat.html 组件 CSS 逐字沉淀） */
export const GEOMETRY = {
  home: {
    homePaddingX: '22px',
    greetPadding: '30px 2px 22px',
    anonPadding: '6px 11px',
    anonRadius: 'var(--r-pill)',
    anonGap: '7px',
    anonFontSize: '12px',
    titleFontSize: '25px',
    titleLineHeight: '1.5',
    subFontSize: '14.5px',
    subMaxWidth: '26ch',
    speakPadding: '18px 18px 14px',
    speakRadius: 'var(--r-field)',
    speakFocusRing: '0 0 0 4px var(--sage-wash)',
    textareaFontSize: '17px',
    textareaLineHeight: '1.62',
    textareaMinHeight: '96px',
    // 输入文字色须跟随时段语义 token（weapp textarea 默认黑字，深夜不可读）
    textareaColor: 'var(--field-ink)',
    speakFootMarginTop: '12px',
    countFontSize: '12px',
    sendHeight: 'var(--tap)',
    sendRadius: 'var(--r-pill)',
    sendFontSize: '15.5px',
    sendShadow: '0 6px 18px rgba(47,107,79,0.22)',
    startersMarginTop: '22px',
    stLabelFontSize: '12.5px',
    stGridGap: '9px',
    starterPadding: '11px 16px',
    starterMinHeight: '44px',
    starterFontSize: '14px',
    starterRadius: 'var(--r-pill)',
    footPaddingTop: '22px',
    footGap: '14px',
    treeholePadding: '13px 15px',
    treeholeRadius: 'var(--r-card)',
    treeholeFontSize: '12.5px'
  },
  chat: {
    // weapp scroll-view 会吃掉自身横向 padding：水平留白须在内层 wrapper
    streamPaddingY: '8px 0 14px',
    streamInnerPaddingX: '0 20px',
    streamGap: '18px',
    msgMaxWidth: '84%',
    openingMarginTop: '8px',
    openingPadding: '6px 2px 2px',
    kickerFontSize: '11px',
    kickerLetterSpacing: '0.18em',
    opLineFontSize: '21px',
    opLineMarginTop: '8px',
    opSubFontSize: '14px',
    bubbleRadius: 'var(--r-bubble)',
    bubblePadding: '12px 15px',
    bubbleFontSize: '15.5px',
    bubbleLineHeight: '1.62',
    bubbleMaxWidth: '84%',
    metaFontSize: '11px',
    followupsGap: '8px',
    followupsMarginTop: '11px',
    chipPadding: '8px 14px',
    chipMinHeight: '36px',
    chipFontSize: '13px',
    thinkRowPadding: '13px 16px',
    slowHintMaxWidth: '30ch',
    composerRadius: '18px',
    composerPadding: '8px 8px 8px 14px',
    composerFocusRing: '0 0 0 3px var(--sage-wash)',
    composerInputFontSize: '15.5px',
    composerInputMaxHeight: '104px',
    // 收敛（2026-08-06 专家裁决）：单行输入与 48px 发送键等高 → 文本垂直居中，
    // 消除契约 min-height:26px + flex-end 在 weapp 真机的「上留白/文本偏低」。多行仍贴底对齐。
    composerInputMinHeight: 'var(--tap)',
    composerInputPadding: '0',
    sendSize: 'var(--tap)',
    sendRadius: '14px',
    nudgeInsetX: '16px',
    dockPadding: '10px 16px calc(8px + env(safe-area-inset-bottom))',
    secondaryRowMargin: '0 2px 9px'
  },
  sheet: {
    sheetRadius: '20px 20px 0 0',
    sheetPadding: '8px 20px calc(20px + env(safe-area-inset-bottom))',
    shTitleFontSize: '18px',
    shTitleLetterSpacing: '0.02em',
    shSubFontSize: '13px',
    shSubMarginBottom: '18px',
    trustItemPadding: '13px 0',
    tiIconSize: '34px',
    tiIconRadius: '10px',
    tiTitleFontSize: '14.5px',
    tiTitleLetterSpacing: '0.01em',
    tiDescFontSize: '13px',
    shFootMarginTop: '18px',
    shDoneFontSize: '14.5px'
  }
} as const
