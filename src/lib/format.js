export function fmtMoney(n) {
  const v = Number(n || 0)
  return '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function fmtTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}小时前`
  const day = Math.floor(hr / 24)
  if (day === 1) return '昨天'
  if (day < 7) return `${day}天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function fmtDeadline(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const hh = p(d.getHours())
  const mm = p(d.getMinutes())
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDay = Math.round((dayStart - startToday) / 86400000)
  if (diffDay === 0) return `今天 ${hh}:${mm}`
  if (diffDay === 1) return `明天 ${hh}:${mm}`
  if (diffDay === -1) return `昨天 ${hh}:${mm}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`
}

export function timeLeft(ts) {
  if (!ts) return ''
  const diff = ts - Date.now()
  if (diff < 0) return '已超时'
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}分钟后截止`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}小时${min % 60}分后截止`
  const day = Math.floor(hr / 24)
  return `${day}天后截止`
}

export function toDateTimeLocal(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}