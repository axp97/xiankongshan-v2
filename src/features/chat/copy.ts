// 客户端 UX / 安全文案（产品所有，非提供方内容）。
// high 与 transition 的展示文案由客户端接管，不使用网关 content。
export const OPENING = {
  kicker: '这里只你一个人，匿名',
  line: '慢慢说，我在这里。',
  sub: '把现在最想说的一句，先放下来。不必完整，不必体面。'
}

// 反依赖层二：当日频次觉察（不显示数字）
export const FREQUENCY_NOTICE = '今天你来了几次，我一直在。不急着说，也不急着走。'

// 反依赖层三：跨日重度关怀（前置，终身一次）
export const CROSSDAY_PREFIX =
  '我注意到你这几天常来。能陪你说话，我不推辞。\n只是也想说一句：如果这种状态持续，让现实里的人或专业帮助也参与进来，会比我一个人陪你更稳。这句话我只说一次，之后不会再提。'

// 反依赖层一：单次善终（温柔收束，不锁输入）
export const GRACE_REPLY =
  '这一程先到这里。\n你愿意把它说出来，已经是好好对待自己了。\n如果哪天想找现实里信任的人说说，那也很好——不用今天，也不用现在。'

// 过渡态（high 复位后）：不邀请行动
export const TRANSITION_REPLY =
  '嗯，谢谢你告诉我。\n刚才那一段不轻易。我还在，你愿意说就说，不想说也行。'

export const riskTitle = (highCount: number): string =>
  highCount <= 1 ? '先停一下，这一刻你不该一个人扛' : '我还在，这一刻仍不该一个人扛'

// high 安全卡正文（对齐 chat.html / product-definition.md §5–§6）：
// 不编造热线、不诊断、不制造恐慌；强调句客户端加粗。
export const RISK_BODY = {
  lead: '你刚才说的让我有点担心你。',
  emph: '我能陪你说话，但我没办法在现实里帮到你。',
  trail:
    '如果此刻很难熬，请试着联系一个你信任的人，或身边的专业帮助——哪怕只是先告诉对方「我现在不太好」。'
}

export const RISK_NOTE = '这不是诊断，也不是评判。你愿意留下来说话，我一直在。'

export const FOLLOWUP_REPLY = {
  more: '好，我接着听。你想从哪一点再说说？哪怕是最小的一件，也可以。',
  angle: '换个角度看——也许现在需要的不是「解决」，只是「被听见」。\n这件事可以慢慢来，今晚先到这里也行。',
  better: '那就好。你随时可以再回来——这里一直在。',
  betterTail: '\n如果哪天想找现实里的人说说，那也很好。',
  reach: '嗯，去找那个人吧。如果一时开不了口，发一句「我现在有点不好」也算。我在这里等你回来。',
  stay: '好，我在。不用说什么，待着也可以。'
}

export const THINK_LABEL = '正在认真读你说的话…'
export const SLOW_HINT = '好像有点慢，可以稍后重试。'

export const ERROR_COPY = {
  title: '这条没能发出去',
  sub: '网络好像断了一下。你的输入还在，可以再试一次。'
}

export const CLEAR_CONFIRM = {
  title: '清除这次的内容？',
  desc: '这次会话里的对话会从这台设备上移除，无法恢复。',
  cancel: '先留着',
  ok: '清除'
}

export const COMPOSER = {
  placeholder: '写下一句现在最想说的话',
  placeholderClosure: '下次想说了，再来',
  nudge: '还没写呢——一个词、半句话都可以。'
}
