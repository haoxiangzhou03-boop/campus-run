import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import { Avatar, StatusBadge, EmptyState } from '../components/ui.jsx'
import { CATEGORY_EMOJI } from '../lib/rules.js'
import { fmtMoney, fmtDeadline } from '../lib/format.js'

const FILTERS = ['全部', '待接单', '进行中', '待验收', '已完成', '已取消']
const MAP = { 待接单: 'pending', 进行中: 'accepted', 待验收: 'delivered', 已完成: 'completed', 已取消: 'cancelled' }

export default function Orders() {
  const { state, currentUser } = useApp()
  const nav = useNavigate()
  const [tab, setTab] = useState('published')
  const [filter, setFilter] = useState('全部')

  const list = useMemo(() => {
    const base = tab === 'published' ? state.tasks.filter((t) => t.publisherId === currentUser.id) : state.tasks.filter((t) => t.runnerId === currentUser.id)
    const st = MAP[filter]
    const arr = st ? base.filter((t) => t.status === st) : base
    return [...arr].sort((a, b) => b.createdAt - a.createdAt)
  }, [state.tasks, tab, filter, currentUser.id])

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('published')} className={`rounded-lg py-2 text-sm font-medium ${tab === 'published' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>我发布的</button>
        <button onClick={() => setTab('taken')} className={`rounded-lg py-2 text-sm font-medium ${tab === 'taken' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>我接的</button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && <EmptyState emoji="📭" text="暂无订单" sub="换个筛选条件看看" />}
        {list.map((t) => {
          const otherId = tab === 'published' ? t.runnerId : t.publisherId
          const other = state.users.find((u) => u.id === otherId)
          return (
            <div key={t.id} onClick={() => nav(`/task/${t.id}`)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{CATEGORY_EMOJI[t.category] || '✨'}</span>
                    <span className="text-xs text-gray-400">{t.category}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h3 className="font-semibold text-gray-800 truncate">{t.title}</h3>
                </div>
                <div className="text-orange-500 font-bold whitespace-nowrap">{fmtMoney(t.reward)}</div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin size={14} className="text-emerald-500 shrink-0" />
                <span className="truncate">{t.pickup}</span>
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
                <span className="truncate">{t.deliver}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={other?.name || '—'} size={24} />
                  <span className="text-xs text-gray-500 truncate">{tab === 'published' ? (other ? `跑腿方：${other.name}` : '等待接单') : `发布者：${other?.name}`}</span>
                </div>
                <span className="text-xs text-gray-400">{fmtDeadline(t.deadline)} 截止</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}