import { STATUS, creditLevel } from '../lib/rules.js'

const PALETTE = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-600', 'bg-amber-500', 'bg-indigo-500']

export function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function Avatar({ name, size = 40, className = '' }) {
  const c = avatarColor(name)
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${c} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {name.slice(0, 1)}
    </div>
  )
}

export function StatusBadge({ status, className = '' }) {
  const s = STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.cls} ${className}`}>{s.label}</span>
}

export function CreditBadge({ credit, className = '' }) {
  const l = creditLevel(credit)
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium text-gray-500 ${className}`}>
      <span>{l.emoji}</span>
      <span className="text-emerald-600 font-semibold">{credit}</span>
      <span>分 · {l.name}</span>
    </span>
  )
}

export function Verified({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-emerald-600 ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14.5-4-4 1.4-1.4L11 13.7l5.6-5.6L18 9.5l-7 7Z"/></svg>
      <span className="text-xs font-medium">已认证</span>
    </span>
  )
}

export function EmptyState({ emoji = '🗂️', text = '暂无数据', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="text-sm font-medium text-gray-500">{text}</div>
      {sub && <div className="text-xs mt-1 text-gray-400">{sub}</div>}
    </div>
  )
}