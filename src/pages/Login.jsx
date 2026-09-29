import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Zap, ShieldCheck, HandCoins, TrendingUp } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import { Avatar, Verified } from '../components/ui.jsx'
import { creditLevel } from '../lib/rules.js'

const FEATURES = [
  { icon: HandCoins, title: '赏金托管', desc: '发布即托管，完成自动放款' },
  { icon: ShieldCheck, title: '实名认证', desc: '校园实名，可信互助' },
  { icon: TrendingUp, title: '信用积累', desc: '信用分与等级，越跑越值钱' },
  { icon: Zap, title: '极速接单', desc: '分类清晰，一键发布与接单' },
]

export default function Login() {
  const { state, currentUser, login } = useApp()
  const nav = useNavigate()
  const [picked, setPicked] = useState('u1')
  if (currentUser) return <Navigate to="/" replace />

  const accounts = state.users.filter((u) => u.role === 'publisher' || u.role === 'runner')
  const pickedUser = state.users.find((u) => u.id === picked)

  const go = () => {
    login(picked)
    nav('/', { replace: true })
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 to-gray-100">
      <div className="mx-auto max-w-md min-h-screen px-6 py-10 flex flex-col">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">🏃</div>
          <h1 className="text-2xl font-bold text-gray-800">跑腿侠 · CampusRun</h1>
          <p className="text-sm text-gray-500 mt-1">可信的校园跑腿互助平台</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-3.5 shadow-sm">
              <f.icon size={20} className="text-emerald-500 mb-2" />
              <div className="text-sm font-semibold text-gray-700">{f.title}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="text-sm font-semibold text-gray-700 mb-2">选择演示账号</div>
        <div className="space-y-3">
          {accounts.map((u) => {
            const lvl = creditLevel(u.credit)
            const selected = picked === u.id
            return (
              <button
                key={u.id}
                onClick={() => setPicked(u.id)}
                className={`w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border-2 transition ${selected ? 'border-emerald-400' : 'border-transparent'}`}
              >
                <Avatar name={u.name} size={44} />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800">{u.name}</span>
                    {u.verified && <Verified />}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {u.role === 'publisher' ? '需求方' : '跑腿方'} · {lvl.emoji} {u.credit}分 · {lvl.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{u.college} · {u.dorm}</div>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-emerald-500' : 'border-gray-200'}`}>
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </span>
              </button>
            )
          })}
        </div>

        <button onClick={go} className="mt-6 w-full bg-emerald-500 text-white rounded-2xl py-3.5 font-semibold shadow-lg shadow-emerald-500/30 active:bg-emerald-600">
          进入平台（{pickedUser?.name}）
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">演示环境：账户、钱包、认证与消息均为模拟数据</p>
      </div>
    </div>
  )
}