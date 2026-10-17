'use strict'

const { COLLECTIONS, success, failure, mapProduct } = require('mori-shared')

exports.main = async (event = {}) => {
  const db = uniCloud.database()
  const productId = String(event.productId || event.id || '').trim()
  if (!productId) {
    return failure('MISSING_PRODUCT_ID', '缺少商品 ID')
  }

  try {
    const result = await db.collection(COLLECTIONS.products).doc(productId).get()
    const doc = Array.isArray(result.data) ? result.data[0] : result.data
    if (!doc || doc.status !== 'on_sale') {
      return failure('PRODUCT_NOT_FOUND', '商品不存在或已下架')
    }
    return success(mapProduct(doc))
  } catch (error) {
    console.error('product-detail failed:', error)
    return failure('PRODUCT_DETAIL_FAILED', '获取商品详情失败，请稍后重试')
  }
}