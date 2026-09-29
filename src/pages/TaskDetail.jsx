import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, FileText, ShieldCheck, Wallet, Star, ChevronRight } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import { Avatar, StatusBadge, CreditBadge, Verified, EmptyState } from '../components/ui.jsx'
import ReviewModal from '../components/ReviewModal.jsx'
import { CATEGORY_EMOJI, CREDIT_GATE } from '../lib/rules.js'
import { fmtMoney, fmtDeadline, fmtTime, timeLeft } from '../lib/format.js'

export default function TaskDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, currentUser, accept, deliver, confirm, review, cancelPublisher, cancelRunner, timeout, dispute, notify } = useApp()
  const [reviewOpen, setReviewOpen] = useState(false)

  const task = state.tasks.find((t) => t.id === id)
  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="text-4xl mb-3">😵</div>
        <div>任务不存在或已被删除</div>
        <button onClick={() => nav('/')} className="mt-4 text-emerald-600 text-sm">返回首页</button>
      </div>
    )
  }

  const publisher = state.users.find((u) => u.id === task.publisherId)
  const runner = state.users.find((u) => u.id === task.runnerId)
  const isPublisher = currentUser.id === task.publisherId
  const isRunner = currentUser.id === task.runnerId
  const involved = isPublisher || isRunner
  const myReviews = state.reviews.filter((r) => r.taskId === task.id && r.fromId === currentUser.id)
  const taskReviews = state.reviews.filter((r) => r.taskId === task.id)


  const creditOk = currentUser.credit >= CREDIT_GATE && currentUser.credit >= (task.minCredit || 0)
  const verifiedOk = !task.requireVerified || currentUser.verified

  const doAccept = () => {
    if (!creditOk) return notify(currentUser.credit < CREDIT_GATE ? '信用分不足 95，暂无法接单' : `该任务要求信用分 ≥ ${task.minCredit}`)
    if (!verifiedOk) return notify('该任务仅限已认证用户接单')
    accept(task.id)
    notify('接单成功！')
  }

  const openReview = () => {
    const toId = isPublisher ? task.runnerId : task.publisherId
    const target = state.users.find((u) => u.id === toId)
    setReviewOpen(target)
  }

  const submitReview = (rating, tags, comment) => {
    const toId = isPublisher ? task.runnerId : task.publisherId
    review(task.id, currentUser.id, toId, rating, tags, comment)
    notify('评价已提交')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => nav(-1)} className="p-1 -ml-1 text-gray-600"><ArrowLeft size={22} /></button>
          <div className="flex-1 text-center font-semibold text-gray-800">任务详情</div>
          <div className="w-8" />
        </div>
      </header>

      {/* status banner */}
      <div className={`px-4 py-2.5 text-sm font-medium ${bannerCls(task.status)}`}>{bannerText(task.status, isPublisher, isRunner)}</div>

      <div className="px-4 py-4 space-y-4">
        {/* head card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{CATEGORY_EMOJI[task.category] || '✨'}</span>
                <span className="text-xs text-gray-400">{task.category}</span>
                <StatusBadge status={task.status} />
              </div>
              <h1 className="text-lg font-bold text-gray-800 leading-snug">{task.title}</h1>
            </div>
            <div className="text-orange-500 font-bold text-2xl whitespace-nowrap">{fmtMoney(task.reward)}</div>
          </div>
          {task.description && <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>}
          {task.image && <img src={task.image} alt="" className="mt-3 w-full max-w-xs rounded-xl object-cover" />}
        </div>

        {/* info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <InfoRow icon={<MapPin size={16} className="text-emerald-500" />} label="取件 / 购买">
            <span className="font-medium text-gray-800">{task.pickup}</span>
          </InfoRow>
          <InfoRow icon={<MapPin size={16} className="text-orange-500" />} label="送达">
            <span className="font-medium text-gray-800">{task.deliver}</span>
          </InfoRow>
          <InfoRow icon={<Clock size={16} className="text-emerald-500" />} label="截止时间">
            <span className="font-medium text-gray-800">{fmtDeadline(task.deadline)}</span>
            <span className={`text-xs ml-1 ${task.deadline < Date.now() ? 'text-rose-500' : 'text-gray-400'}`}>（{timeLeft(task.deadline)}）</span>
          </InfoRow>
          <InfoRow icon={<FileText size={16} className="text-gray-400" />} label="订单编号">
            <span className="text-xs text-gray-400 font-mono">{task.id.toUpperCase()}</span>
          </InfoRow>
        </div>

        {/* escrow */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Wallet size={18} /></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-emerald-800">赏金 {fmtMoney(task.reward)} 已安全托管</div>
            <div className="text-xs text-emerald-600 mt-0.5">确认收货后自动放款给跑腿方，取消或超时原路退回</div>
          </div>
          <ShieldCheck size={22} className="text-emerald-400" />
        </div>

        {/* publisher */}
        <UserCard title="发布者" user={publisher} extra={`发布 ${publisher?.publishedCount || 0} · 完成率 ${publisher?.onTimeRate || 0}%`} />

        {/* runner */}
        {runner && <UserCard title="跑腿方" user={runner} extra={`完成 ${runner?.completedCount || 0} 单 · 评分 ${runner?.avgRating || '-'}`} />}

        {/* reviews */}
        {taskReviews.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 mb-3">双方评价（{taskReviews.length}）</div>
            <div className="space-y-3">
              {taskReviews.map((r) => {
                const from = state.users.find((u) => u.id === r.fromId)
                return (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={from?.name} size={28} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{from?.name}</div>
                        <div className="flex text-amber-400 text-xs">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className={i <= r.rating ? 'fill-amber-400' : 'text-gray-200 fill-gray-100'} />)}</div>
                      </div>
                      <span className="text-xs text-gray-400">{fmtTime(r.createdAt)}</span>
                    </div>
                    {r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.tags.map((t) => <span key={t} className="text-xs bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">{t}</span>)}
                      </div>
                    )}
                    {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {task.status === 'cancelled' && (
          <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600">
            订单已取消：{task.cancelReason || '已取消'}
          </div>
        )}
        {task.status === 'disputed' && (
          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-700">
            该订单正在申诉处理中，平台客服将尽快介入。
          </div>
        )}
      </div>

      {/* action bar */}
      <ActionBar
        task={task}
        isPublisher={isPublisher}
        isRunner={isRunner}
        involved={involved}
        myReviewed={myReviews.length > 0}
        creditOk={creditOk}
        verifiedOk={verifiedOk}
        onAccept={doAccept}
        onDeliver={() => { deliver(task.id); notify('已标记送达，等待确认收货') }}
        onConfirm={() => { confirm(task.id); notify('已确认收货，赏金已放款') }}
        onReview={openReview}
        onCancelPublisher={() => { cancelPublisher(task.id); notify('任务已取消，赏金已退回') }}
        onCancelRunner={() => { cancelRunner(task.id); notify('已取消接单，信用分 -5') }}
        onTimeout={() => { timeout(task.id); notify('已模拟超时：赏金退回，跑腿信用 -2') }}
        onDispute={() => { dispute(task.id); notify('已提交申诉，等待平台处理') }}
      />

      {reviewOpen && (
        <ReviewModal open target={reviewOpen} onClose={() => setReviewOpen(false)} onSubmit={submitReview} />
      )}
    </div>
  )
}

function bannerCls(status) {
  const map = { pending: 'bg-amber-50 text-amber-700', accepted: 'bg-blue-50 text-blue-700', delivered: 'bg-violet-50 text-violet-700', completed: 'bg-emerald-50 text-emerald-700', reviewed: 'bg-gray-100 text-gray-500', cancelled: 'bg-rose-50 text-rose-600', disputed: 'bg-orange-50 text-orange-700' }
  return map[status] || 'bg-gray-50 text-gray-500'
}

function bannerText(status, isPublisher, isRunner) {
  if (status === 'pending') return isPublisher ? '任务待接单中，等待跑腿侠接单…' : '该任务等待接单，快来看看吧！'
  if (status === 'accepted') return isPublisher ? '已有跑腿方接单，进行中…' : isRunner ? '你已接下此单，请按时完成' : '该任务已被接单，进行中'
  if (status === 'delivered') return isPublisher ? '跑腿方已送达，请确认收货' : '等待发布者确认收货'
  if (status === 'completed') return '任务已完成，等待双方评价'
  if (status === 'reviewed') return '任务已完成，双方已评价'
  if (status === 'cancelled') return '订单已取消'
  if (status === 'disputed') return '订单申诉处理中'
  return ''
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  )
}

function UserCard({ title, user, extra }) {
  if (!user) return null
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-gray-400 mb-3">{title}</div>
      <div className="flex items-center gap-3">
        <Avatar name={user.name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">{user.name}</span>
            {user.verified && <Verified />}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{extra}</div>
        </div>
        <CreditBadge credit={user.credit} />
      </div>
    </div>
  )
}

function ActionBar(props) {
  const { task, isPublisher, isRunner, involved, myReviewed, creditOk, verifiedOk } = props
  const s = task.status

  if (s === 'pending' && isPublisher) {
    return <Bar><button onClick={props.onCancelPublisher} className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3 font-medium">取消任务（退回赏金）</button></Bar>
  }
  if (s === 'pending' && !isPublisher) {
    const blocked = !creditOk || !verifiedOk
    const hint = !verifiedOk ? '仅限已认证用户接单' : !creditOk ? '信用分不足，无法接单' : ''
    return (
      <Bar>
        <button disabled={blocked} onClick={props.onAccept} className="w-full bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-semibold">
          {blocked ? hint : '立即接单'}
        </button>
      </Bar>
    )
  }
  if (s === 'accepted' && isRunner) {
    return (
      <Bar>
        <button onClick={props.onCancelRunner} className="px-4 bg-white border border-gray-200 text-gray-500 rounded-xl py-3 text-sm">取消接单（-5分）</button>
        <button onClick={props.onDeliver} className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-semibold">标记已送达</button>
      </Bar>
    )
  }
  if (s === 'accepted' && isPublisher) {
    return (
      <Bar>
        <button onClick={props.onTimeout} className="px-4 bg-white border border-gray-200 text-gray-500 rounded-xl py-3 text-sm">模拟超时</button>
        <button onClick={props.onDispute} className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-semibold">提交申诉</button>
      </Bar>
    )
  }
  if (s === 'delivered' && isPublisher) {
    return <Bar><button onClick={props.onConfirm} className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold">确认收货并放款</button></Bar>
  }
  if (s === 'delivered' && isRunner) {
    return <Bar><div className="w-full text-center text-sm text-gray-400 py-2">等待发布者确认收货…</div></Bar>
  }
  if (s === 'completed' && involved && !myReviewed) {
    return <Bar><button onClick={props.onReview} className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold">去评价</button></Bar>
  }
  if (s === 'completed' && involved && myReviewed) {
    return <Bar><div className="w-full text-center text-sm text-gray-400 py-2">你已评价，等待对方评价</div></Bar>
  }
  return null
}

function Bar({ children }) {
  return <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 flex gap-3 z-40">{children}</div>
}