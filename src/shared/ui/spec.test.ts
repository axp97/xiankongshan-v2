import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BASE_TOKENS, PALETTES, PALETTE_CSS_NAME, GEOMETRY, ACTIVE_THEMES } from './spec'

// 三向交叉断言：spec ⇔ 契约 HTML ⇔ 实现 scss。
// 目标态断言（TDD 先红）：实现未对齐处先红，修复后转绿。

const ROOT = join(__dirname, '..', '..', '..')
/** 读文件并剥离块注释，避免注释干扰选择器/块级正则 */
const read = (p: string) =>
  readFileSync(join(ROOT, p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** 归一化：去空白、hex 小写、小数补/去零（.10 == 0.1） */
const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/#([0-9a-f]{3,8})\b/g, (_, h) => `#${h}`)
    .replace(/(^|[(,\s])(\.\d+)/g, (_, p, d) => `${p}0${d}`)
    .replace(/(\.\d*?)0+(?=[,)]|$)/g, (_, d) => (d === '.' ? '' : d))

const ruleOf = (src: string, selector: string): string => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp(`${esc}\\s*\\{([^}]*)\\}`).exec(src)
  return m ? m[1] : ''
}
const decl = (block: string, prop: string): string => {
  const esc = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp(`(?:^|;)\\s*${esc}\\s*:\\s*([^;]+);`).exec(block)
  return m ? m[1].trim() : ''
}

const chatHtml = () => read('reference/陷空山UX设计/chat.html')
const homeHtml = () => read('reference/陷空山UX设计/home.html')
const themeScss = () => read('src/shared/theme.scss')
const homeScss = () => read('src/features/home/HomeView.scss')
const chatScss = () => read('src/features/chat/ChatView.scss')
const trustScss = () => read('src/features/privacy/TrustSheet.scss')

describe('spec ⇔ 契约 HTML（防 spec 沉淀漂移）', () => {
  it('BASE_TOKENS 与 chat.html :root 一致', () => {
    const root = chatHtml().match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    const pairs = [...root.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(
      (m) => [m[1], m[2].trim()] as [string, string]
    )
    const map = new Map(pairs)
    const expectMap: Record<string, string> = {
      '--sage': BASE_TOKENS.sage,
      '--deep': BASE_TOKENS.deep,
      '--deep-press': BASE_TOKENS.deepPress,
      '--notice': BASE_TOKENS.notice,
      '--danger': BASE_TOKENS.danger,
      '--soft': BASE_TOKENS.soft,
      '--line-soft': BASE_TOKENS.lineSoft,
      '--notice-wash': BASE_TOKENS.noticeWash,
      '--sage-wash': BASE_TOKENS.sageWash,
      '--r-card': BASE_TOKENS.rCard,
      '--r-bubble': BASE_TOKENS.rBubble,
      '--r-pill': BASE_TOKENS.rPill,
      '--tap': BASE_TOKENS.tap,
      '--shadow-soft': BASE_TOKENS.shadowSoft,
      '--ease': BASE_TOKENS.ease
    }
    for (const [name, want] of Object.entries(expectMap)) {
      expect(norm(map.get(name.replace(/^--/, '')) ?? ''), `${name}`).toBe(norm(want))
    }
  })

  it('shadow-input / r-field 与 home.html :root 一致', () => {
    const root = homeHtml().match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    const m = /--shadow-input\s*:\s*([^;]+);/.exec(root)
    expect(norm(m?.[1] ?? '')).toBe(norm(BASE_TOKENS.shadowInput))
    const r = /--r-field\s*:\s*([^;]+);/.exec(root)
    expect(norm(r?.[1] ?? '')).toBe(norm(BASE_TOKENS.rField))
  })

  it('PALETTES 四时段与 chat.html TOD 表逐值一致', () => {
    const src = chatHtml()
    const tods = [...src.matchAll(/(morning|day|evening|night):\{vars:\{([^}]*)\}\}/g)]
    expect(tods.length).toBe(4)
    for (const [, tod, body] of tods) {
      const vars = new Map(
        [...body.matchAll(/'--([\w-]+)'\s*:\s*'([^']+)'/g)].map((m) => [m[1], m[2]] as [string, string])
      )
      const specPalette = PALETTES[tod as keyof typeof PALETTES]
      for (const [key, cssName] of Object.entries(PALETTE_CSS_NAME)) {
        const want = specPalette[key as keyof typeof specPalette]
        expect(norm(vars.get(cssName.replace('--', '')) ?? ''), `${tod} ${cssName}`).toBe(
          norm(want)
        )
      }
    }
  })
})

describe('spec ⇔ theme.scss（weapp 根 token 护栏）', () => {
  it('基础 token 经 mixin 双发 :root 与 page（WXSS 不识 :root，须 page 双发）', () => {
    const src = themeScss()
    const mixinBlock = src.match(/@mixin\s+root-tokens\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(mixinBlock.length, 'theme.scss 须含 @mixin root-tokens').toBeGreaterThan(0)
    const rootBlock = src.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    const pageBlock = src.match(/(?:^|\})\s*page\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rootBlock, ':root 须 @include root-tokens').toContain('@include root-tokens')
    expect(pageBlock, 'page 须 @include root-tokens（weapp 根 token 护栏）').toContain(
      '@include root-tokens'
    )
    const names = ['--sage', '--r-card', '--r-field', '--r-bubble', '--r-pill', '--tap', '--shadow-soft', '--shadow-input', '--ease', '--notice', '--danger']
    for (const n of names) {
      expect(mixinBlock.includes(n), `mixin ${n}`).toBe(true)
    }
    expect(norm(decl(mixinBlock, '--shadow-soft'))).toBe(norm(BASE_TOKENS.shadowSoft))
  })

  it('启用主题（day/night）palette 与 SPEC 逐值一致', () => {
    const src = themeScss()
    const rules = [...src.matchAll(/\.tod-([\w-]+)[^{]*\{([^}]*)\}/g)]
    const byTod = new Map<string, string>()
    for (const m of rules) {
      const names = m[0].match(/\.tod-([\w-]+)/g)?.map((s) => s.replace('.tod-', '')) ?? []
      for (const n of names) byTod.set(n, m[2])
    }
    for (const tod of ACTIVE_THEMES) {
      const block = byTod.get(tod) ?? ''
      expect(block.length, `.tod-${tod} 存在`).toBeGreaterThan(0)
      const palette = PALETTES[tod]
      for (const [key, cssName] of Object.entries(PALETTE_CSS_NAME)) {
        if (key === 'statusbarInk') continue // weapp 导航栏走 setNavigationBarColor，不入 scss
        const got = decl(block, cssName)
        expect(norm(got), `${tod} ${cssName}`).toBe(norm(palette[key as keyof typeof palette]))
      }
    }
  })
})

describe('spec ⇔ 实现 scss（组件几何/字阶）', () => {
  const H = GEOMETRY.home
  const C = GEOMETRY.chat
  const S = GEOMETRY.sheet

  it('home 页几何', () => {
    const src = homeScss()
    expect(norm(decl(ruleOf(src, '.home'), 'padding'))).toBe(norm(`0 22px calc(16px + env(safe-area-inset-bottom))`))
    expect(norm(decl(ruleOf(src, '.greet'), 'padding'))).toBe(norm(H.greetPadding))
    const anon = ruleOf(src, '.greet .anon')
    expect(norm(decl(anon, 'padding'))).toBe(norm(H.anonPadding))
    expect(norm(decl(anon, 'border-radius'))).toBe(norm(H.anonRadius))
    expect(norm(decl(anon, 'font-size'))).toBe(norm(H.anonFontSize))
    const title = ruleOf(src, '.greet .title')
    expect(norm(decl(title, 'font-size'))).toBe(norm(H.titleFontSize))
    expect(norm(decl(title, 'line-height'))).toBe(norm(H.titleLineHeight))
    const sub = ruleOf(src, '.greet .sub')
    expect(norm(decl(sub, 'font-size'))).toBe(norm(H.subFontSize))
    expect(norm(decl(sub, 'max-width'))).toBe(norm(H.subMaxWidth))
    const speak = ruleOf(src, '.speak')
    expect(norm(decl(speak, 'padding'))).toBe(norm(H.speakPadding))
    expect(norm(decl(speak, 'border-radius'))).toBe(norm(H.speakRadius))
    const focused = ruleOf(src, '.speak.focused')
    expect(decl(focused, 'box-shadow')).toContain(H.speakFocusRing)
    const ta = ruleOf(src, '.speak .say')
    expect(norm(decl(ta, 'font-size'))).toBe(norm(H.textareaFontSize))
    expect(norm(decl(ta, 'line-height'))).toBe(norm(H.textareaLineHeight))
    expect(norm(decl(ta, 'min-height'))).toBe(norm(H.textareaMinHeight))
    expect(norm(decl(ta, 'color')), '输入文字色须为 field-ink（weapp 默认黑字不可读）').toBe(
      norm(H.textareaColor)
    )
    const foot = ruleOf(src, '.speak .speak-foot')
    expect(norm(decl(foot, 'margin-top'))).toBe(norm(H.speakFootMarginTop))
    const send = ruleOf(src, '.speak .send')
    expect(norm(decl(send, 'height'))).toBe(norm(H.sendHeight))
    expect(norm(decl(send, 'border-radius'))).toBe(norm(H.sendRadius))
    expect(norm(decl(send, 'font-size'))).toBe(norm(H.sendFontSize))
    expect(norm(decl(send, 'box-shadow'))).toBe(norm(H.sendShadow))
    const st = ruleOf(src, '.starter')
    expect(norm(decl(st, 'padding'))).toBe(norm(H.starterPadding))
    expect(norm(decl(st, 'min-height'))).toBe(norm(H.starterMinHeight))
    expect(norm(decl(st, 'font-size'))).toBe(norm(H.starterFontSize))
    expect(norm(decl(st, 'border-radius'))).toBe(norm(H.starterRadius))
    expect(norm(decl(ruleOf(src, '.starters .st-grid'), 'gap'))).toBe(norm(H.stGridGap))
    expect(norm(decl(ruleOf(src, '.treehole-hint'), 'padding'))).toBe(norm(H.treeholePadding))
    expect(norm(decl(ruleOf(src, '.treehole-hint'), 'border-radius'))).toBe(norm(H.treeholeRadius))
  })

  it('chat 页几何', () => {
    const src = chatScss()
    // 横向留白在内层 wrapper（weapp scroll-view 吃自身 padding 护栏）
    expect(norm(decl(ruleOf(src, '.stream'), 'padding'))).toBe(norm(C.streamPaddingY))
    const inner = ruleOf(src, '.stream-inner')
    expect(norm(decl(inner, 'padding'))).toBe(norm(C.streamInnerPaddingX))
    expect(decl(inner, 'display')).toBe('flex')
    expect(norm(decl(inner, 'gap'))).toBe(norm(C.streamGap))
    expect(norm(decl(ruleOf(src, '.msg'), 'max-width'))).toBe(norm(C.msgMaxWidth))
    const op = ruleOf(src, '.opening .op-line')
    expect(norm(decl(op, 'font-size'))).toBe(norm(C.opLineFontSize))
    expect(norm(decl(op, 'margin-top'))).toBe(norm(C.opLineMarginTop))
    const kicker = ruleOf(src, '.opening .kicker')
    expect(norm(decl(kicker, 'font-size'))).toBe(norm(C.kickerFontSize))
    expect(norm(decl(kicker, 'letter-spacing'))).toBe(norm(C.kickerLetterSpacing))
    const bubble = ruleOf(src, '.msg .bubble')
    expect(norm(decl(bubble, 'border-radius'))).toBe(norm(C.bubbleRadius))
    expect(norm(decl(bubble, 'padding'))).toBe(norm(C.bubblePadding))
    expect(norm(decl(bubble, 'font-size'))).toBe(norm(C.bubbleFontSize))
    expect(norm(decl(bubble, 'max-width'))).toBe(norm(C.bubbleMaxWidth))
    const chip = ruleOf(src, '.followups .chip')
    expect(norm(decl(chip, 'padding'))).toBe(norm(C.chipPadding))
    expect(norm(decl(chip, 'min-height'))).toBe(norm(C.chipMinHeight))
    expect(norm(decl(chip, 'font-size'))).toBe(norm(C.chipFontSize))
    expect(norm(decl(ruleOf(src, '.slow-hint'), 'max-width'))).toBe(norm(C.slowHintMaxWidth))
    const composer = ruleOf(src, '.composer')
    expect(norm(decl(composer, 'border-radius'))).toBe(norm(C.composerRadius))
    expect(norm(decl(composer, 'padding'))).toBe(norm(C.composerPadding))
    expect(decl(ruleOf(src, '.composer.focused'), 'box-shadow')).toContain(C.composerFocusRing)
    const cInput = ruleOf(src, '.composer .input')
    expect(norm(decl(cInput, 'min-height')), '单行输入与发送键等高（垂直居中收敛）').toBe(
      norm(C.composerInputMinHeight)
    )
    expect(norm(decl(cInput, 'max-height'))).toBe(norm(C.composerInputMaxHeight))
    expect(norm(decl(cInput, 'padding'))).toBe(norm(C.composerInputPadding))
    const send = ruleOf(src, '.composer .send')
    expect(norm(decl(send, 'width'))).toBe(norm(C.sendSize))
    expect(norm(decl(send, 'border-radius'))).toBe(norm(C.sendRadius))
    // 契约语义：发送键基础态即主色（绿），仅 disabled 灰
    expect(norm(decl(send, 'background'))).toBe('var(--send-bg)')
    const nudge = ruleOf(src, '.nudge')
    expect(norm(decl(nudge, 'left'))).toBe(norm(C.nudgeInsetX))
    expect(norm(decl(nudge, 'right'))).toBe(norm(C.nudgeInsetX))
    expect(norm(decl(ruleOf(src, '.dock'), 'padding'))).toBe(norm(C.dockPadding))
    expect(norm(decl(ruleOf(src, '.secondary-row'), 'margin'))).toBe(norm(C.secondaryRowMargin))
  })

  it('信任 sheet 几何', () => {
    const src = trustScss()
    const sheet = ruleOf(src, '.sheet')
    expect(norm(decl(sheet, 'border-radius'))).toBe(norm(S.sheetRadius))
    expect(norm(decl(sheet, 'padding'))).toBe(norm(S.sheetPadding))
    const t = ruleOf(src, '.sheet .sh-title')
    expect(norm(decl(t, 'font-size'))).toBe(norm(S.shTitleFontSize))
    expect(norm(decl(t, 'letter-spacing'))).toBe(norm(S.shTitleLetterSpacing))
    const sub = ruleOf(src, '.sheet .sh-sub')
    expect(norm(decl(sub, 'margin-bottom'))).toBe(norm(S.shSubMarginBottom))
    const ti = ruleOf(src, '.trust-item .ti-t')
    expect(norm(decl(ti, 'font-size'))).toBe(norm(S.tiTitleFontSize))
    expect(norm(decl(ti, 'letter-spacing'))).toBe(norm(S.tiTitleLetterSpacing))
    expect(norm(decl(ruleOf(src, '.sh-foot'), 'margin-top'))).toBe(norm(S.shFootMarginTop))
    expect(norm(decl(ruleOf(src, '.sh-done'), 'font-size'))).toBe(norm(S.shDoneFontSize))
  })
})
