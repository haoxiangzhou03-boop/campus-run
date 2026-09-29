import { useApp } from '../store/AppStore.jsx'
import { EmptyState } from '../components/ui.jsx'
import { fmtTime } from '../lib/format.js'

export default function Messages() {
  const { state, currentUser, markRead, readAll } = useApp()
  const list = state.messages.filter((m) => m.userId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt)
  const unread = list.filter((m) => !m.read).length

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-800">消息通知</div>
        {unread > 0 && <button onClick={readAll} className="text-sm text-emerald-600">全部已读</button>}
      </div>
      {list.length === 0 && <EmptyState emoji="🔔" text="暂无消息" />}
      {list.map((m) => (
        <button key={m.id} onClick={() => markRead(m.id)} className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${m.read ? 'bg-transparent' : 'bg-emerald-500'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${m.read ? 'text-gray-500' : 'text-gray-800'}`}>{m.title}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">{fmtTime(m.createdAt)}</span>
              </div>
              <div className={`text-sm mt-1 leading-relaxed ${m.read ? 'text-gray-400' : 'text-gray-500'}`}>{m.text}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}