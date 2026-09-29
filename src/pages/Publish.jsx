import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, ImagePlus, X } from 'lucide-react'
import { useApp } from '../store/AppStore.jsx'
import { CATEGORIES, CATEGORY_EMOJI } from '../lib/rules.js'
import { fmtMoney, toDateTimeLocal } from '../lib/format.js'

export default function Publish() {
  const { currentUser, publish, notify } = useApp()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState(CATEGORIES[0])
  const [reward, setReward] = useState(5)
  const [pickup, setPickup] = useState('')
  const [deliver, setDeliver] = useState('')
  const [deadline, setDeadline] = useState(() => toDateTimeLocal(Date.now() + 2 * 3600 * 1000))
  const [desc, setDesc] = useState('')
  const [requireVerified, setRequireVerified] = useState(false)
  const [images, setImages] = useState([])

  const rewardNum = Number(reward)
  const valid = title.trim() && pickup.trim() && deliver.trim() && rewardNum >= 1 && deadline
  const insufficient = rewardNum > currentUser.balance

  const addImage = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((f) => {
      if (!f.type.startsWith('image/')) return
      const r = new FileReader()
      r.onload = () => setImages((s) => [...s, r.result])
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }

  const submit = () => {
    if (!valid) return notify('请填写完整信息')
    if (insufficient) return notify('钱包余额不足，无法托管赏金')
    publish({
      title: title.trim(),
      category: cat,
      reward: rewardNum,
      pickup: pickup.trim(),
      deliver: deliver.trim(),
      deadline: new Date(deadline).getTime(),
      description: desc.trim(),
      requireVerified,
      minCredit: 0,
      image: images[0] || null,
    })
    notify('发布成功，赏金已托管')
    nav('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => nav(-1)} className="p-1 -ml-1 text-gray-600"><ArrowLeft size={22} /></button>
          <div className="flex-1 text-center font-semibold text-gray-800">发布任务</div>
          <div className="w-8" />
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">任务分类</div>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-xl py-2.5 flex flex-col items-center gap-1 text-xs ${cat === c ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400' : 'bg-white text-gray-500 ring-1 ring-gray-100'}`}
              >
                <span className="text-xl">{CATEGORY_EMOJI[c]}</span>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <Field label="任务标题">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} placeholder="例如：代取中通快递 2 件" className="input" />
          </Field>
          <Field label="赏金（元）">
            <input type="number" min={1} value={reward} onChange={(e) => setReward(e.target.value)} className="input text-orange-500 font-semibold" />
          </Field>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <Field label="取件 / 购买地点" icon={<MapPin size={16} className="text-emerald-500" />}>
            <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="例如：菜鸟驿站·东门" className="input" />
          </Field>
          <Field label="送达地点" icon={<MapPin size={16} className="text-orange-500" />}>
            <input value={deliver} onChange={(e) => setDeliver(e.target.value)} placeholder="例如：梅园2栋 302" className="input" />
          </Field>
          <Field label="截止时间" icon={<Clock size={16} className="text-emerald-500" />}>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
          </Field>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">任务描述</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="补充细节：数量、口味、取件码等" className="w-full rounded-xl bg-gray-50 p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-emerald-300" />
          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <ImagePlus size={18} /> 添加图片（选填）
              <input type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
            </label>
            {images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <button onClick={() => setImages((s) => s.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-sm text-gray-600">仅限已认证用户接单</span>
            <input type="checkbox" checked={requireVerified} onChange={(e) => setRequireVerified(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
          </label>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700 leading-relaxed">
          发布后将立即托管赏金 <b>{fmtMoney(rewardNum)}</b>。任务完成并确认收货后自动放款给跑腿方；取消或超时则原路退回。
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-500">钱包余额 {fmtMoney(currentUser.balance)}</span>
          <span className="text-gray-500">本次托管 <span className="text-orange-500 font-semibold">{fmtMoney(rewardNum)}</span></span>
        </div>
        <button onClick={submit} disabled={!valid || insufficient} className="w-full bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-semibold">
          发布任务
        </button>
      </div>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">{icon}{label}</div>
      {children}
    </label>
  )
}