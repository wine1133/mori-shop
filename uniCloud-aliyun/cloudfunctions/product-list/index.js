'use strict'

const { COLLECTIONS, success, failure, mapProduct, clampInteger } = require('mori-shared')

exports.main = async (event = {}) => {
  const db = uniCloud.database()
  try {
    const page = clampInteger(event.page, 1, 9999, 1)
    const pageSize = clampInteger(event.pageSize, 1, 50, 20)
    const where = { status: 'on_sale' }
    if (event.category && event.category !== '全部') {
      where.category = String(event.category).slice(0, 32)
    }

    const collection = db.collection(COLLECTIONS.products).where(where)
    const [listResult, countResult] = await Promise.all([
      collection.orderBy('sort', 'asc').skip((page - 1) * pageSize).limit(pageSize).get(),
      db.collection(COLLECTIONS.products).where(where).count()
    ])

    return success({
      list: (listResult.data || []).map(mapProduct),
      total: Number(countResult.total || 0),
      page,
      pageSize
    })
  } catch (error) {
    console.error('product-list failed:', error)
    return failure('PRODUCT_LIST_FAILED', '获取商品列表失败，请稍后重试')
  }
}