import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { REVIEW_TAGS } from '../lib/rules.js'
import { Avatar } from './ui.jsx'

const RATING_TEXT = ['', '很差', '较差', '一般', '满意', '超赞']

export default function ReviewModal({ open, target, onClose, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [tags, setTags] = useState([])
  const [comment, setComment] = useState('')
  if (!open) return null

  const toggleTag = (t) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))

  const submit = () => {
    onSubmit(rating, tags, comment)
    setRating(5)
    setTags([])
    setComment('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={target?.name} size={42} />
            <div>
              <div className="font-semibold text-gray-800">{target?.name}</div>
              <div className="text-xs text-gray-400">评价将影响对方的信用分</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={20} /></button>
        </div>
        <div className="flex justify-center gap-2 py-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)}>
              <Star size={32} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'} />
            </button>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mb-4">{RATING_TEXT[rating]}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {REVIEW_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`rounded-full px-3 py-1 text-sm ${tags.includes(t) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="说说这次体验吧（选填）"
          rows={3}
          className="w-full rounded-xl bg-gray-50 p-3 text-sm outline-none resize-none mb-4"
        />
        <button onClick={submit} className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold active:bg-emerald-600">
          提交评价
        </button>
      </div>
    </div>
  )
}