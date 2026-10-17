'use strict'

const { COLLECTIONS, success, failure, mapOrder, resolveUserId, clampInteger } = require('mori-shared')

exports.main = async (event = {}, context = {}) => {
  const db = uniCloud.database()
  try {
    const userId = resolveUserId(context, event)
    const page = clampInteger(event.page, 1, 9999, 1)
    const pageSize = clampInteger(event.pageSize, 1, 50, 20)
    const where = { user_id: userId }
    if (event.status) where.status = String(event.status).slice(0, 32)

    const [listResult, countResult] = await Promise.all([
      db.collection(COLLECTIONS.orders)
        .where(where)
        .orderBy('created_at', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get(),
      db.collection(COLLECTIONS.orders).where(where).count()
    ])

    return success({
      list: (listResult.data || []).map(mapOrder),
      total: Number(countResult.total || 0),
      page,
      pageSize
    })
  } catch (error) {
    if (error instanceof Error && error.code === 'MISSING_USER') {
      return failure('MISSING_USER', '缺少用户身份，无法查询订单')
    }
    console.error('order-list failed:', error)
    return failure('ORDER_LIST_FAILED', '查询订单失败，请稍后重试')
  }
}