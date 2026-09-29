import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import TaskCard from '../components/TaskCard.jsx'
import { EmptyState } from '../components/ui.jsx'
import { CATEGORIES, CREDIT_GATE } from '../lib/rules.js'

export default function Home() {
  const { state, currentUser, accept, notify } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('全部')
  const [sort, setSort] = useState('newest')

  const list = useMemo(() => {
    let arr = state.tasks.filter((t) => t.status === 'pending' && t.publisherId !== currentUser.id)
    if (cat !== '全部') arr = arr.filter((t) => t.category === cat)
    if (q.trim()) {
      const kw = q.trim()
      arr = arr.filter((t) => (t.title + t.description + t.pickup + t.deliver).includes(kw))
    }
    if (sort === 'reward') arr = [...arr].sort((a, b) => b.reward - a.reward)
    else if (sort === 'deadline') arr = [...arr].sort((a, b) => a.deadline - b.deadline)
    else arr = [...arr].sort((a, b) => b.createdAt - a.createdAt)
    return arr
  }, [state.tasks, cat, q, sort, currentUser.id])

  const handleAccept = (task) => {
    if (currentUser.credit < CREDIT_GATE) return notify('信用分不足 95，暂无法接单')
    if (currentUser.credit < (task.minCredit || 0)) return notify(`该任务要求信用分 ≥ ${task.minCredit}`)
    if (task.requireVerified && !currentUser.verified) return notify('该任务仅限已认证用户接单')
    accept(task.id)
    notify('接单成功！')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-gray-500">Hi，{currentUser.name} 👋</div>
          <div className="text-lg font-bold text-gray-800">今天想找谁帮忙跑腿？</div>
        </div>
        <div className="text-xs text-gray-400">华东大学·梅园校区</div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索任务、地点、关键词…"
          className="w-full rounded-xl bg-white border border-gray-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-300"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {['全部', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${cat === c ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">共 {list.length} 个可接任务</div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm text-gray-500 bg-transparent outline-none">
          <option value="newest">最新发布</option>
          <option value="reward">赏金最高</option>
          <option value="deadline">即将截止</option>
        </select>
      </div>

      <div className="space-y-3">
        {list.length === 0 && <EmptyState emoji="🎉" text="暂时没有匹配的任务" sub="换个分类或搜索词试试" />}
        {list.map((t) => (
          <TaskCard key={t.id} task={t} users={state.users} onAccept={handleAccept} />
        ))}
      </div>
    </div>
  )
}