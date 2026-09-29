import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { buildSeed, uid } from '../data/seed.js'

const KEY = 'campusrun:v3'
const SEED = buildSeed()
const AppContext = createContext(null)

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.version === SEED.version) return parsed
    }
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(SEED))
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUserId: action.id }
    case 'LOGOUT':
      return { ...state, currentUserId: null }
    case 'RESET':
      return { ...JSON.parse(JSON.stringify(SEED)), currentUserId: state.currentUserId }
    case 'PUBLISH': {
      const { userId, data } = action
      const task = {
        id: uid('t'),
        ...data,
        status: 'pending',
        publisherId: userId,
        runnerId: null,
        acceptedAt: null,
        deliveredAt: null,
        completedAt: null,
        cancelReason: '',
        createdAt: Date.now(),
      }
      const reward = Number(data.reward)
      const users = state.users.map((u) =>
        u.id === userId
          ? { ...u, balance: round2(u.balance - reward), publishedCount: (u.publishedCount || 0) + 1 }
          : u,
      )
      const transactions = [...state.transactions, { id: uid('tx'), taskId: task.id, userId, type: 'escrow_hold', amount: -reward, title: '发布任务·托管赏金', createdAt: Date.now() }]
      const messages = [...state.messages, { id: uid('m'), userId, taskId: task.id, type: 'system', title: '发布成功', text: `任务「${task.title}」已发布，赏金 ¥${reward} 已托管。`, read: false, createdAt: Date.now() }]
      return { ...state, users, tasks: [task, ...state.tasks], transactions, messages }
    }
    case 'ACCEPT': {
      const { taskId, userId } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'accepted', runnerId: userId, acceptedAt: Date.now() } : t))
      const messages = [...state.messages, { id: uid('m'), userId, taskId, type: 'order', title: '接单成功', text: `你已接下任务「${task.title}」，请在截止时间前完成。`, read: false, createdAt: Date.now() }]
      return { ...state, tasks, messages }
    }
    case 'DELIVER': {
      const { taskId } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'delivered', deliveredAt: Date.now() } : t))
      const messages = [...state.messages, { id: uid('m'), userId: task.publisherId, taskId, type: 'order', title: '跑腿已送达', text: `你的任务「${task.title}」已被送达，请确认收货。`, read: false, createdAt: Date.now() }]
      return { ...state, tasks, messages }
    }
    case 'CONFIRM': {
      const { taskId } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const onTime = task.deliveredAt && task.deadline ? task.deliveredAt <= task.deadline : false
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'completed', completedAt: Date.now() } : t))
      const users = state.users.map((u) => {
        if (u.id === task.runnerId) {
          const credit = u.credit + 3 + (onTime ? 1 : 0)
          return { ...u, balance: round2(u.balance + Number(task.reward)), credit, completedCount: (u.completedCount || 0) + 1 }
        }
        return u
      })
      const transactions = [...state.transactions, { id: uid('tx'), taskId, userId: task.runnerId, type: 'escrow_release', amount: Number(task.reward), title: '任务完成·收到赏金', createdAt: Date.now() }]
      const messages = [...state.messages, { id: uid('m'), userId: task.runnerId, taskId, type: 'system', title: '赏金到账', text: `任务「${task.title}」已完成，赏金 ¥${task.reward} 已发放。信用分 ${onTime ? '+4' : '+3'}`, read: false, createdAt: Date.now() }]
      return { ...state, tasks, users, transactions, messages }
    }
    case 'REVIEW': {
      const { taskId, fromId, toId, rating, tags, comment } = action
      const review = { id: uid('r'), taskId, fromId, toId, rating, tags, comment, createdAt: Date.now() }
      const reviews = [...state.reviews, review]
      const delta = rating <= 2 ? -5 : rating >= 4 ? 1 : 0
      const users = state.users.map((u) => {
        if (u.id === toId) {
          const extra = rating >= 4 ? { goodReviews: (u.goodReviews || 0) + 1 } : {}
          return { ...u, credit: u.credit + delta, ...extra }
        }
        return u
      })
      const bothReviewed = reviews.some((r) => r.taskId === taskId && r.fromId === toId)
      const tasks = bothReviewed ? state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'reviewed' } : t)) : state.tasks
      return { ...state, reviews, users, tasks }
    }
    case 'CANCEL_PUBLISHER': {
      const { taskId, reason } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'cancelled', cancelReason: reason || '发布者取消' } : t))
      const users = state.users.map((u) => (u.id === task.publisherId ? { ...u, balance: round2(u.balance + Number(task.reward)) } : u))
      const transactions = [...state.transactions, { id: uid('tx'), taskId, userId: task.publisherId, type: 'escrow_refund', amount: Number(task.reward), title: '取消任务·赏金退回', createdAt: Date.now() }]
      return { ...state, tasks, users, transactions }
    }
    case 'CANCEL_RUNNER': {
      const { taskId } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'pending', runnerId: null, acceptedAt: null } : t))
      const users = state.users.map((u) => (u.id === task.runnerId ? { ...u, credit: u.credit - 5 } : u))
      const messages = [...state.messages, { id: uid('m'), userId: task.publisherId, taskId, type: 'order', title: '跑腿取消订单', text: `跑腿方取消了任务「${task.title}」，任务已重新回到待接单状态。`, read: false, createdAt: Date.now() }]
      return { ...state, tasks, users, messages }
    }
    case 'TIMEOUT': {
      const { taskId } = action
      const task = state.tasks.find((t) => t.id === taskId)
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'cancelled', cancelReason: '超时未完成，已退款' } : t))
      const users = state.users.map((u) => {
        if (u.id === task.publisherId) return { ...u, balance: round2(u.balance + Number(task.reward)) }
        if (u.id === task.runnerId) return { ...u, credit: u.credit - 2 }
        return u
      })
      const transactions = [...state.transactions, { id: uid('tx'), taskId, userId: task.publisherId, type: 'escrow_refund', amount: Number(task.reward), title: '超时取消·赏金退回', createdAt: Date.now() }]
      return { ...state, tasks, users, transactions }
    }
    case 'DISPUTE': {
      const { taskId } = action
      const tasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'disputed' } : t))
      return { ...state, tasks }
    }
    case 'VERIFY': {
      const { userId, info } = action
      const users = state.users.map((u) =>
        u.id === userId ? { ...u, verified: true, studentId: info.studentId || u.studentId, college: info.college || u.college } : u,
      )
      return { ...state, users }
    }
    case 'READ': {
      const { msgId } = action
      const messages = state.messages.map((m) => (m.id === msgId ? { ...m, read: true } : m))
      return { ...state, messages }
    }
    case 'READ_ALL': {
      const { userId } = action
      const messages = state.messages.map((m) => (m.userId === userId ? { ...m, read: true } : m))
      return { ...state, messages }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const notify = useCallback((text) => {
    setToast(text)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) || null
    return {
      state,
      currentUser,
      login: (id) => { dispatch({ type: 'LOGIN', id }); notify('登录成功，欢迎回来！') },
      logout: () => dispatch({ type: 'LOGOUT' }),
      reset: () => { dispatch({ type: 'RESET' }); notify('演示数据已重置') },
      publish: (data) => dispatch({ type: 'PUBLISH', userId: state.currentUserId, data }),
      accept: (taskId) => dispatch({ type: 'ACCEPT', taskId, userId: state.currentUserId }),
      deliver: (taskId) => dispatch({ type: 'DELIVER', taskId }),
      confirm: (taskId) => dispatch({ type: 'CONFIRM', taskId }),
      review: (taskId, fromId, toId, rating, tags, comment) => dispatch({ type: 'REVIEW', taskId, fromId, toId, rating, tags, comment }),
      cancelPublisher: (taskId, reason) => dispatch({ type: 'CANCEL_PUBLISHER', taskId, reason }),
      cancelRunner: (taskId) => dispatch({ type: 'CANCEL_RUNNER', taskId }),
      timeout: (taskId) => dispatch({ type: 'TIMEOUT', taskId }),
      dispute: (taskId) => dispatch({ type: 'DISPUTE', taskId }),
      verify: (info) => dispatch({ type: 'VERIFY', userId: state.currentUserId, info }),
      markRead: (msgId) => dispatch({ type: 'READ', msgId }),
      readAll: () => dispatch({ type: 'READ_ALL', userId: state.currentUserId }),
      notify,
      toast,
    }
  }, [state, toast, notify])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}