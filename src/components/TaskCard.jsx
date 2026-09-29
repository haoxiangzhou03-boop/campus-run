import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import { CATEGORY_EMOJI, CREDIT_GATE } from '../lib/rules.js'
import { fmtMoney, fmtDeadline, timeLeft } from '../lib/format.js'
import { Avatar, StatusBadge, CreditBadge, Verified } from './ui.jsx'

export default function TaskCard({ task, users, onAccept }) {
  const nav = useNavigate()
  const publisher = users.find((u) => u.id === task.publisherId)


  return (
    <div onClick={() => nav(`/task/${task.id}`)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg leading-none">{CATEGORY_EMOJI[task.category] || '✨'}</span>
            <span className="text-xs text-gray-400">{task.category}</span>
            <StatusBadge status={task.status} />
          </div>
          <h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
        </div>
        <div className="text-orange-500 font-bold text-lg whitespace-nowrap">{fmtMoney(task.reward)}</div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-emerald-500 shrink-0" />
          <span className="truncate">{task.pickup}</span>
          <ChevronRight size={12} className="text-gray-300 shrink-0" />
          <span className="truncate">{task.deliver}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-emerald-500 shrink-0" />
          <span>{fmtDeadline(task.deadline)} 截止</span>
          <span className="text-xs text-gray-300">·</span>
          <span className={task.deadline < Date.now() ? 'text-rose-500' : ''}>{timeLeft(task.deadline)}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={publisher?.name} size={26} />
          <span className="text-sm text-gray-700 truncate">{publisher?.name}</span>
          {publisher?.verified && <Verified />}
          <CreditBadge credit={publisher?.credit} />
        </div>
        {onAccept && (
          <span
            onClick={(e) => { e.stopPropagation(); onAccept(task) }}
            className="ml-2 shrink-0 rounded-full bg-emerald-500 text-white text-sm font-medium px-4 py-1.5 active:bg-emerald-600"
          >
            接单
          </span>
        )}
      </div>
    </div>
  )
}