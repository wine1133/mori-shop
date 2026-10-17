'use strict'

const { COLLECTIONS, success, failure } = require('mori-shared')
const products = require('./products.json')

exports.main = async (event = {}) => {
  const db = uniCloud.database()
  const expectedToken = process.env.SEED_TOKEN
  if (expectedToken && event.seedToken !== expectedToken) {
    return failure('FORBIDDEN', '初始化令牌不正确')
  }

  try {
    let created = 0
    let updated = 0

    for (const product of products) {
      const { _id, ...data } = product
      const payload = {
        ...data,
        status: data.status || 'on_sale',
        updated_at: Date.now()
      }

      try {
        const result = await db.collection(COLLECTIONS.products).doc(_id).get()
        const existing = Array.isArray(result.data) ? result.data[0] : result.data
        if (existing) {
          await db.collection(COLLECTIONS.products).doc(_id).update(payload)
          updated += 1
        } else {
          await db.collection(COLLECTIONS.products).add({ _id, ...payload })
          created += 1
        }
      } catch (error) {
        await db.collection(COLLECTIONS.products).add({ _id, ...payload })
        created += 1
      }
    }

    return success({ created, updated, total: products.length }, '示例商品初始化完成')
  } catch (error) {
    console.error('seed-products failed:', error)
    return failure('SEED_PRODUCTS_FAILED', '初始化示例商品失败')
  }
}