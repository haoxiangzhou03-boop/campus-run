import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, Plus, Award, User, Bell } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import Toast from './Toast.jsx'

const isFullScreen = (path) => path.startsWith('/publish') || path.startsWith('/task/')

export default function Shell() {
  const { currentUser, state, toast } = useApp()
  const loc = useLocation()
  const nav = useNavigate()
  const fs = isFullScreen(loc.pathname)
  const unread = state.messages.filter((m) => m.userId === currentUser?.id && !m.read).length

  const tabs = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/orders', icon: ClipboardList, label: '订单' },
    { to: null, icon: Plus, label: '发布', center: true },
    { to: '/credit', icon: Award, label: '信用' },
    { to: '/profile', icon: User, label: '我的' },
  ]

  return (
    <div className="min-h-full bg-gray-200">
      <div className="mx-auto max-w-md min-h-screen bg-gray-50 shadow-xl relative flex flex-col">
        {!fs && (
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="font-bold text-gray-800">
                跑腿侠 <span className="text-emerald-500">·</span> CampusRun
              </div>
              <button onClick={() => nav('/messages')} className="relative p-2 text-gray-500">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}
        <main className={`flex-1 ${fs ? '' : 'pb-20'}`}>
          <Outlet />
        </main>
        {!fs && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-40">
            <div className="grid grid-cols-5 h-16">
              {tabs.map((t) =>
                t.center ? (
                  <button key="publish" onClick={() => nav('/publish')} className="flex items-center justify-center">
                    <span className="w-12 h-12 -mt-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <Plus size={26} />
                    </span>
                  </button>
                ) : (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`
                    }
                  >
                    <t.icon size={22} />
                    <span className="text-[11px]">{t.label}</span>
                  </NavLink>
                ),
              )}
            </div>
          </nav>
        )}
        <Toast toast={toast} />
      </div>
    </div>
  )
}