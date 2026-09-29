import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ShieldCheck, Award, Bell, Info, RotateCcw, LogOut, ChevronRight, X, Plus } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import { Avatar, Verified, CreditBadge } from '../components/ui.jsx'
import { creditLevel } from '../lib/rules.js'
import { fmtMoney } from '../lib/format.js'

export default function Profile() {
  const { currentUser, verify, reset, logout, notify } = useApp()
  const nav = useNavigate()
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [topUp, setTopUp] = useState(false)
  const lvl = creditLevel(currentUser.credit)

  const stats = [
    { label: '发布', val: currentUser.publishedCount || 0 },
    { label: '完成', val: currentUser.completedCount || 0 },
    { label: '准时率', val: (currentUser.onTimeRate || 0) + '%' },
    { label: '评分', val: currentUser.avgRating || '-' },
  ]

  return (
    <div className="px-4 py-4 space-y-4">
      {/* profile head */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} size={60} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-800">{currentUser.name}</span>
              {currentUser.verified && <Verified />}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{currentUser.college} · {currentUser.dorm}</div>
            <div className="mt-1.5"><CreditBadge credit={currentUser.credit} /></div>
          </div>
          <div className="text-3xl">{lvl.emoji}</div>
        </div>
        <p className="text-sm text-gray-500 mt-3">{currentUser.bio}</p>
      </div>

      {/* wallet */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/30 flex items-center justify-between">
        <div>
          <div className="text-sm text-orange-50">我的钱包</div>
          <div className="text-3xl font-bold mt-1">{fmtMoney(currentUser.balance)}</div>
          <div className="text-xs text-orange-50 mt-1">发布任务时用于托管赏金</div>
        </div>
        <button onClick={() => setTopUp(true)} className="bg-white/20 rounded-full px-4 py-2 text-sm">充值</button>
      </div>

      {/* stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-lg font-bold text-gray-800">{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* verify */}
      {!currentUser.verified && (
        <button onClick={() => setVerifyOpen(true)} className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-white flex items-center justify-center"><ShieldCheck size={18} /></div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-amber-700">完成校园实名认证</div>
            <div className="text-xs text-amber-600 mt-0.5">认证后可接「仅限认证用户」的任务，提升信任度</div>
          </div>
          <ChevronRight size={18} className="text-amber-400" />
        </button>
      )}

      {/* menu */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <MenuItem icon={<Bell size={18} className="text-emerald-500" />} label="消息通知" onClick={() => nav('/messages')} />
        <MenuItem icon={<Award size={18} className="text-violet-500" />} label="信用中心" onClick={() => nav('/credit')} />
        <MenuItem icon={<Info size={18} className="text-blue-500" />} label="关于平台" onClick={() => setAboutOpen(true)} />
        <MenuItem icon={<RotateCcw size={18} className="text-gray-400" />} label="重置演示数据" onClick={() => { if (window.confirm('确定重置所有演示数据吗？')) reset() }} />
        <MenuItem icon={<LogOut size={18} className="text-rose-500" />} label="退出登录" onClick={() => { logout(); nav('/login', { replace: true }) }} border={false} />
      </div>

      {/* verify modal */}
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onDone={(info) => { verify(info); notify('认证成功！'); setVerifyOpen(false) }} />}

      {/* topup modal */}
      {topUp && <TopUpModal onClose={() => setTopUp(false)} />}

      {/* about modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setAboutOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-800">关于跑腿侠 · CampusRun</div>
              <button onClick={() => setAboutOpen(false)} className="p-1 text-gray-400"><X size={20} /></button>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>「跑腿侠」是面向大学生的可信校园跑腿互助平台：学生可以发布任务、接单跑腿、积累信用。</p>
              <p>核心机制：<b>实名认证</b>建立信任基础，<b>赏金托管</b>保障资金安全，<b>信用分与双向评价</b>沉淀长期信用，<b>排行榜与勋章</b>激励优质跑腿。</p>
              <p className="text-xs text-gray-400">本作品为前端交互原型，账户、钱包、认证与消息均为演示数据。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, border = true }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 ${border ? 'border-b border-gray-50' : ''}`}>
      {icon}
      <span className="flex-1 text-left text-sm text-gray-700">{label}</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}

function VerifyModal({ onClose, onDone }) {
  const [name, setName] = useState('')
  const [sid, setSid] = useState('')
  const [college, setCollege] = useState('')
  const [card, setCard] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-gray-800">校园实名认证</div>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="真实姓名" className="input" />
          <input value={sid} onChange={(e) => setSid(e.target.value)} placeholder="学号" className="input" />
          <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="学院" className="input" />
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer">
            <Plus size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">{card ? '校园卡照片已添加（演示）' : '上传校园卡 / 学生证照片'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={() => setCard(true)} />
          </label>
        </div>
        <button
          onClick={() => onDone({ name: name || '认证用户', studentId: sid, college: college })}
          className="w-full mt-5 bg-emerald-500 text-white rounded-xl py-3 font-semibold"
        >
          提交认证
        </button>
      </div>
    </div>
  )
}

function TopUpModal({ onClose }) {
  const [amt, setAmt] = useState(50)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-gray-800">充值钱包（演示）</div>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[20, 50, 100].map((v) => (
            <button key={v} onClick={() => setAmt(v)} className={`rounded-xl py-3 text-sm font-semibold ${amt === v ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>¥{v}</button>
          ))}
        </div>
        <button onClick={() => { alert('演示环境：未接入真实支付，充值不生效'); onClose() }} className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold">确认充值</button>
      </div>
    </div>
  )
}