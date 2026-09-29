export const CATEGORIES = ['代取快递', '代买餐食', '代占座', '代打印', '代送文件', '代拿外卖', '拼单代购', '其他']

export const CATEGORY_EMOJI = {
  '代取快递': '📦',
  '代买餐食': '🍜',
  '代占座': '💺',
  '代打印': '🖨️',
  '代送文件': '📄',
  '代拿外卖': '🥡',
  '拼单代购': '🛒',
  '其他': '✨',
}

export const STATUS = {
  pending: { label: '待接单', cls: 'bg-amber-100 text-amber-700' },
  accepted: { label: '进行中', cls: 'bg-blue-100 text-blue-700' },
  delivered: { label: '待验收', cls: 'bg-violet-100 text-violet-700' },
  completed: { label: '已完成', cls: 'bg-emerald-100 text-emerald-700' },
  reviewed: { label: '已评价', cls: 'bg-slate-200 text-slate-600' },
  cancelled: { label: '已取消', cls: 'bg-rose-100 text-rose-600' },
  disputed: { label: '申诉中', cls: 'bg-orange-100 text-orange-700' },
}

export const CREDIT_RULES = [
  { label: '完成任务', delta: '+3', good: true },
  { label: '准时送达', delta: '+1', good: true },
  { label: '收到好评', delta: '+1', good: true },
  { label: '超时未完成', delta: '-2', good: false },
  { label: '跑腿取消订单', delta: '-5', good: false },
  { label: '收到差评', delta: '-5', good: false },
]

export const LEVELS = [
  { min: 150, name: '跑腿大神', rank: 4, emoji: '👑', color: 'text-amber-500' },
  { min: 130, name: '跑腿达人', rank: 3, emoji: '🚀', color: 'text-violet-500' },
  { min: 110, name: '靠谱跑腿', rank: 2, emoji: '💪', color: 'text-blue-500' },
  { min: 0, name: '新手跑腿', rank: 1, emoji: '🌱', color: 'text-emerald-500' },
]

export function creditLevel(credit) {
  for (const l of LEVELS) if (credit >= l.min) return l
  return LEVELS[LEVELS.length - 1]
}

export function nextLevel(credit) {
  const current = creditLevel(credit)
  const idx = LEVELS.findIndex((l) => l === current)
  return { current, next: idx > 0 ? LEVELS[idx - 1] : null }
}

export const REVIEW_TAGS = ['准时', '沟通好', '物品完好', '速度快', '态度好']

export const BADGES = [
  { id: 'diligent', name: '勤劳小蜜蜂', emoji: '🐝', desc: '累计完成 ≥ 20 单', ok: (u) => u.completedCount >= 20 },
  { id: 'punctual', name: '准时达人', emoji: '⏰', desc: '准时率 ≥ 95%', ok: (u) => u.onTimeRate >= 95 },
  { id: 'good', name: '好评收割机', emoji: '👍', desc: '收到 ≥ 10 条好评', ok: (u) => u.goodReviews >= 10 },
  { id: 'allround', name: '全能跑腿', emoji: '🎯', desc: '覆盖 ≥ 5 类任务', ok: (u) => u.categoryCount >= 5 },
]

export function earnedBadges(user) {
  return BADGES.filter((b) => b.ok(user))
}

export const CREDIT_GATE = 95
export const INITIAL_CREDIT = 100
export const CAMPUS = '华东大学 · 梅园校区'