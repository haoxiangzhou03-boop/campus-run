import { useMemo, useState } from 'react'
import { useApp } from '../store/AppStore.jsx'
import { Avatar, Verified, CreditBadge } from '../components/ui.jsx'
import { creditLevel, nextLevel, CREDIT_RULES, BADGES, earnedBadges } from '../lib/rules.js'

export default function Credit() {
  const { state, currentUser } = useApp()
  const [tab, setTab] = useState('total')
  const lvl = creditLevel(currentUser.credit)
  const nl = nextLevel(currentUser.credit)
  const badges = earnedBadges(currentUser)

  const pct = useMemo(() => {
    if (!nl.next) return 100
    return Math.min(100, Math.max(0, Math.round(((currentUser.credit - nl.current.min) / (nl.next.min - nl.current.min)) * 100)))
  }, [nl, currentUser.credit])

  const board = useMemo(() => {
    const key = tab === 'total' ? 'credit' : 'weeklyCount'
    return [...state.users].sort((a, b) => (b[key] || 0) - (a[key] || 0))
  }, [state.users, tab])

  return (
    <div className="px-4 py-4 space-y-4">
      {/* score card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-emerald-50">我的信用分</div>
            <div className="text-5xl font-bold mt-1">{currentUser.credit}</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">{lvl.emoji} {lvl.name}</div>
          </div>
          <div className="text-right text-sm text-emerald-50">
            <div>完成 {currentUser.completedCount || 0} 单</div>
            <div className="mt-1">好评 {currentUser.goodReviews || 0} 条</div>
            <div className="mt-1">准时率 {currentUser.onTimeRate || 0}%</div>
          </div>
        </div>
        {nl.next ? (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-emerald-50 mb-1">
              <span>{lvl.name}</span>
              <span>再得 {nl.next.min - currentUser.credit} 分升级「{nl.next.name}」</span>
            </div>
            <div className="h-2 rounded-full bg-white/25 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-emerald-50">已达最高等级，继续保持！</div>
        )}
      </div>

      {/* rules */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">信用规则</div>
        <div className="grid grid-cols-2 gap-2">
          {CREDIT_RULES.map((r) => (
            <div key={r.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
              <span className="text-sm text-gray-600">{r.label}</span>
              <span className={`text-sm font-semibold ${r.good ? 'text-emerald-600' : 'text-rose-500'}`}>{r.delta}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">信用分低于 95 时将限制接单，请爱惜信用哦～</p>
      </div>

      {/* badges */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">我的勋章（{badges.length}/{BADGES.length}）</div>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const earned = badges.some((x) => x.id === b.id)
            return (
              <div key={b.id} className={`rounded-xl p-3 flex items-center gap-2.5 ${earned ? 'bg-emerald-50' : 'bg-gray-50 opacity-60'}`}>
                <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{b.emoji}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-700">{b.name}</div>
                  <div className="text-[11px] text-gray-400">{b.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* leaderboard */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700">跑腿排行榜</div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTab('total')} className={`px-2.5 py-1 text-xs rounded-md ${tab === 'total' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>总榜</button>
            <button onClick={() => setTab('week')} className={`px-2.5 py-1 text-xs rounded-md ${tab === 'week' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>周榜</button>
          </div>
        </div>
        <div className="space-y-1">
          {board.map((u, i) => (
            <div key={u.id} className={`flex items-center gap-3 p-2 rounded-xl ${u.id === currentUser.id ? 'bg-emerald-50' : ''}`}>
              <span className={`w-6 text-center font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>{i + 1}</span>
              <Avatar name={u.name} size={34} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-800">{u.name}</span>
                  {u.verified && <Verified />}
                </div>
                <CreditBadge credit={u.credit} />
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">{tab === 'total' ? u.credit + '分' : (u.weeklyCount || 0) + '单'}</div>
                <div className="text-[11px] text-gray-400">{tab === 'total' ? '信用分' : '本周完成'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}