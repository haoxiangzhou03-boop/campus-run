let seq = 0
export const uid = (p) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

export function buildSeed() {
  const t = Date.now()
  const min = 60 * 1000
  const hr = 60 * min
  const day = 24 * hr

  const users = [
    { id: 'u1', name: '张三', role: 'publisher', verified: true, studentId: '2022010101', college: '计算机学院', dorm: '梅园2栋 302', balance: 100, credit: 118, completedCount: 12, publishedCount: 15, weeklyCount: 2, onTimeRate: 96, goodReviews: 10, categoryCount: 4, avgRating: 4.9, bio: '爱囤快递的计算机er，求助跑腿侠们～', joinDay: 320 },
    { id: 'u2', name: '李四', role: 'runner', verified: true, studentId: '2021010203', college: '经管学院', dorm: '竹园1栋 110', balance: 85.5, credit: 132, completedCount: 46, publishedCount: 2, weeklyCount: 8, onTimeRate: 98, goodReviews: 18, categoryCount: 6, avgRating: 4.8, bio: '下课顺路跑腿，主打一个准时！', joinDay: 600 },
    { id: 'u3', name: '王五', role: 'runner', verified: true, studentId: '2020010305', college: '机电学院', dorm: '松园3栋 205', balance: 60, credit: 145, completedCount: 58, publishedCount: 0, weeklyCount: 5, onTimeRate: 92, goodReviews: 15, categoryCount: 7, avgRating: 4.6, bio: '老学长，跑腿稳定可靠。', joinDay: 800 },
    { id: 'u4', name: '赵六', role: 'runner', verified: true, studentId: '2021010407', college: '软件学院', dorm: '梅园1栋 501', balance: 40, credit: 156, completedCount: 72, publishedCount: 1, weeklyCount: 11, onTimeRate: 99, goodReviews: 30, categoryCount: 8, avgRating: 5.0, bio: '校园跑腿榜一，使命必达！', joinDay: 900 },
    { id: 'u5', name: '孙七', role: 'publisher', verified: true, studentId: '2022010502', college: '外国语学院', dorm: '竹园2栋 406', balance: 70, credit: 105, completedCount: 3, publishedCount: 20, weeklyCount: 1, onTimeRate: 85, goodReviews: 2, categoryCount: 2, avgRating: 4.4, bio: '经常需要代买早餐和打印～', joinDay: 280 },
    { id: 'u6', name: '周八', role: 'runner', verified: true, studentId: '2023010609', college: '土木学院', dorm: '松园5栋 610', balance: 52, credit: 88, completedCount: 9, publishedCount: 0, weeklyCount: 3, onTimeRate: 80, goodReviews: 3, categoryCount: 3, avgRating: 4.2, bio: '新人跑腿，多多关照。', joinDay: 120 },
  ]

  const tasks = [
    { id: 't1', title: '代取中通快递 3 件（较重）', category: '代取快递', reward: 5, status: 'pending', publisherId: 'u1', runnerId: null, pickup: '菜鸟驿站·东门', deliver: '梅园2栋 楼下快递柜', deadline: t + 2 * hr, description: '三件中通快递，其中一件比较重（约10kg），帮忙搬到梅园2栋楼下快递柜即可，取件码私聊发你。', image: null, requireVerified: true, minCredit: 0, createdAt: t - 20 * min, acceptedAt: null, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't2', title: '帮忙带一份二食堂黄焖鸡米饭', category: '代买餐食', reward: 8, status: 'pending', publisherId: 'u5', runnerId: null, pickup: '二食堂 2F 黄焖鸡窗口', deliver: '竹园2栋 406', deadline: t + 1 * hr, description: '微辣，加一份米饭，不要香菜。送到竹园2栋406，谢谢！', image: null, requireVerified: false, minCredit: 0, createdAt: t - 10 * min, acceptedAt: null, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't3', title: '图书馆 3 楼帮忙占个靠窗座位', category: '代占座', reward: 6, status: 'pending', publisherId: 'u1', runnerId: null, pickup: '图书馆 3 楼 靠窗区', deliver: '图书馆 3 楼（占座）', deadline: t + 8 * hr, description: '明天上午有考试复习，帮忙明早 7:30 前在图书馆3楼靠窗占个位置，到了联系我。', image: null, requireVerified: true, minCredit: 110, createdAt: t - 5 * min, acceptedAt: null, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't4', title: '打印一份 20 页复习资料', category: '代打印', reward: 3, status: 'pending', publisherId: 'u5', runnerId: null, pickup: '校园打印店（东门旁）', deliver: '竹园2栋 406', deadline: t + 3 * hr, description: '我把PDF发你，打印20页单面，装订好送到宿舍，打印费实报实销（截图）。', image: null, requireVerified: false, minCredit: 0, createdAt: t - 40 * min, acceptedAt: null, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't5', title: '代送文件到行政楼教务处', category: '代送文件', reward: 10, status: 'accepted', publisherId: 'u1', runnerId: 'u2', pickup: '梅园2栋 302', deliver: '行政楼 2F 教务处', deadline: t + 1.5 * hr, description: '一份密封材料需要送到教务处窗口，取件后直接送过去，务必今天下班前送到。', image: null, requireVerified: true, minCredit: 100, createdAt: t - 50 * min, acceptedAt: t - 30 * min, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't6', title: '代拿外卖：炸鸡奶茶到竹园', category: '代拿外卖', reward: 4, status: 'accepted', publisherId: 'u5', runnerId: 'u3', pickup: '东门外卖柜', deliver: '竹园2栋 楼下', deadline: t + 40 * min, description: '外卖已到东门外卖柜，取件码私聊发你，送到竹园2栋楼下。', image: null, requireVerified: false, minCredit: 0, createdAt: t - 35 * min, acceptedAt: t - 25 * min, deliveredAt: null, completedAt: null, cancelReason: '' },
    { id: 't7', title: '代取顺丰快递并送上门', category: '代取快递', reward: 6, status: 'delivered', publisherId: 'u1', runnerId: 'u2', pickup: '顺丰驿站·西门', deliver: '梅园2栋 302', deadline: t + 30 * min, description: '顺丰快递一件，已到西门驿站，取件后送到梅园2栋302。', image: null, requireVerified: true, minCredit: 0, createdAt: t - 2 * hr, acceptedAt: t - 1.5 * hr, deliveredAt: t - 10 * min, completedAt: null, cancelReason: '' },
    { id: 't8', title: '代买水果捞 + 奶茶', category: '代买餐食', reward: 12, status: 'completed', publisherId: 'u1', runnerId: 'u2', pickup: '商业街 鲜果时光', deliver: '梅园2栋 302', deadline: t - 1 * hr, description: '一份水果捞（芒果+芋圆）加一杯珍珠奶茶，送到宿舍，谢谢！', image: null, requireVerified: false, minCredit: 0, createdAt: t - 3 * hr, acceptedAt: t - 2.5 * hr, deliveredAt: t - 2 * hr, completedAt: t - 1.5 * hr, cancelReason: '' },
    { id: 't9', title: '代取京东快递（日用品）', category: '代取快递', reward: 5, status: 'reviewed', publisherId: 'u1', runnerId: 'u4', pickup: '京东派·北门', deliver: '梅园2栋 302', deadline: t - 1 * day, description: '京东快递两件日用品，帮忙取回送到宿舍。', image: null, requireVerified: false, minCredit: 0, createdAt: t - 1 * day - 2 * hr, acceptedAt: t - 1 * day - 1 * hr, deliveredAt: t - 1 * day - 30 * min, completedAt: t - 1 * day, cancelReason: '' },
    { id: 't10', title: '拼单代购：瑞幸咖啡 4 杯', category: '拼单代购', reward: 9, status: 'reviewed', publisherId: 'u5', runnerId: 'u2', pickup: '瑞幸咖啡（南门）', deliver: '竹园2栋 大厅', deadline: t - 2 * day, description: '帮忙代购4杯瑞幸，口味发你，送到竹园2栋大厅。', image: null, requireVerified: false, minCredit: 0, createdAt: t - 2 * day - 3 * hr, acceptedAt: t - 2 * day - 2 * hr, deliveredAt: t - 2 * day - 1 * hr, completedAt: t - 2 * day - 40 * min, cancelReason: '' },
    { id: 't11', title: '明早图书馆占座', category: '代占座', reward: 6, status: 'cancelled', publisherId: 'u1', runnerId: 'u2', pickup: '图书馆 4 楼', deliver: '图书馆 4 楼（占座）', deadline: t - 2 * day, description: '帮忙明早占座。', image: null, requireVerified: false, minCredit: 0, createdAt: t - 2 * day - 4 * hr, acceptedAt: t - 2 * day - 3 * hr, deliveredAt: null, completedAt: null, cancelReason: '超时未完成，已退款' },
  ]

  const reviews = [
    { id: 'r1', taskId: 't9', fromId: 'u1', toId: 'u4', rating: 5, tags: ['准时', '物品完好'], comment: '赵六效率超高，两件快递很快送到，感谢！', createdAt: t - 1 * day + 10 * min },
    { id: 'r2', taskId: 't9', fromId: 'u4', toId: 'u1', rating: 5, tags: ['沟通好'], comment: '需求方信息清晰，取件顺利，好评！', createdAt: t - 1 * day + 15 * min },
    { id: 'r3', taskId: 't10', fromId: 'u5', toId: 'u2', rating: 5, tags: ['准时', '速度快'], comment: '李四送得又快又稳，咖啡还是热的！', createdAt: t - 2 * day + 20 * min },
    { id: 'r4', taskId: 't10', fromId: 'u2', toId: 'u5', rating: 4, tags: ['沟通好'], comment: '订单信息明确，合作愉快。', createdAt: t - 2 * day + 25 * min },
  ]

  const transactions = [
    { id: 'tx1', taskId: 't8', userId: 'u1', type: 'escrow_hold', amount: -12, title: '发布任务·托管赏金', createdAt: t - 3 * hr },
    { id: 'tx2', taskId: 't8', userId: 'u2', type: 'escrow_release', amount: 12, title: '任务完成·收到赏金', createdAt: t - 1.5 * hr },
    { id: 'tx3', taskId: 't9', userId: 'u1', type: 'escrow_hold', amount: -5, title: '发布任务·托管赏金', createdAt: t - 1 * day - 2 * hr },
    { id: 'tx4', taskId: 't9', userId: 'u4', type: 'escrow_release', amount: 5, title: '任务完成·收到赏金', createdAt: t - 1 * day },
  ]

  const messages = [
    { id: 'm1', userId: 'u1', taskId: 't7', type: 'order', title: '跑腿已送达', text: '李四已送达你的任务「代取顺丰快递并送上门」，请确认收货。', read: false, createdAt: t - 8 * min },
    { id: 'm2', userId: 'u2', taskId: 't5', type: 'order', title: '接单成功', text: '你已接下任务「代送文件到行政楼教务处」，请在截止时间前完成。', read: false, createdAt: t - 30 * min },
    { id: 'm3', userId: 'u2', taskId: 't8', type: 'system', title: '赏金到账', text: '任务「代买水果捞 + 奶茶」已完成，赏金 ¥12 已发放到你的钱包。', read: true, createdAt: t - 1.5 * hr },
    { id: 'm4', userId: 'u1', taskId: null, type: 'system', title: '欢迎加入跑腿侠', text: '欢迎来到跑腿侠 · CampusRun！发布任务、接单跑腿、积累信用，从今天开始。', read: true, createdAt: t - 10 * day },
    { id: 'm5', userId: 'u2', taskId: null, type: 'system', title: '信用小贴士', text: '准时送达并收到好评可提升信用分；取消订单会扣 5 分哦。', read: true, createdAt: t - 5 * day },
  ]

  return {
    version: 3,
    currentUserId: null,
    users,
    tasks,
    reviews,
    transactions,
    messages,
  }
}