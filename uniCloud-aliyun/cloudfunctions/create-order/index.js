'use strict'

const {
  COLLECTIONS,
  ORDER_STATUS,
  BusinessError,
  success,
  failure,
  mapOrder,
  formatTimeText,
  makeOrderNo,
  resolveUserId,
  normalizeAddress,
  normalizeItems,
  buildOrderDraft
} = require('mori-shared')

async function getTransactionDocument(transaction, collectionName, documentId) {
  try {
    const result = await transaction.collection(collectionName).doc(documentId).get()
    return Array.isArray(result.data) ? result.data[0] : result.data
  } catch (error) {
    return null
  }
}

exports.main = async (event = {}, context = {}) => {
  const db = uniCloud.database()
  let transaction = null

  try {
    const userId = resolveUserId(context, event)
    const items = normalizeItems(event)
    const address = normalizeAddress(event.address)
    const uniqueProductIds = [...new Set(items.map((item) => item.productId))]

    transaction = await db.startTransaction()
    const products = []

    for (const productId of uniqueProductIds) {
      const product = await getTransactionDocument(transaction, COLLECTIONS.products, productId)
      if (!product || product.status !== 'on_sale') {
        throw new BusinessError('PRODUCT_NOT_FOUND', `商品 ${productId} 不存在或已下架`)
      }
      products.push(product)
    }

    // Prices and stock are always resolved on the server; client-provided prices are ignored.
    const draft = buildOrderDraft(products, items)
    const now = Date.now()

    for (const update of draft.stockUpdates) {
      await transaction.collection(COLLECTIONS.products).doc(update.productId).update({
        sizes: update.sizes,
        updated_at: now
      })
    }

    const addressText = `${address.name} · ${address.phone} · ${address.region}${address.detail}`
    const orderDoc = {
      order_no: makeOrderNo(now),
      user_id: userId,
      user_info: {
        nickname: String(event.userInfo?.nickname || address.name || '').slice(0, 60),
        phone: address.phone
      },
      address,
      address_text: addressText,
      items: draft.items,
      item_count: draft.items.reduce((sum, item) => sum + item.quantity, 0),
      total: draft.total,
      status: ORDER_STATUS.pendingPayment,
      status_text: '待付款',
      payment_status: 'unpaid',
      payment_status_text: '未支付',
      created_at: now,
      created_at_text: formatTimeText(now),
      updated_at: now
    }

    const addResult = await transaction.collection(COLLECTIONS.orders).add(orderDoc)
    await transaction.commit()

    return success(mapOrder({
      ...orderDoc,
      _id: addResult.id
    }), '订单创建成功')
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback()
      } catch (rollbackError) {
        console.error('transaction rollback failed:', rollbackError)
      }
    }

    if (error instanceof BusinessError) {
      return failure(error.code, error.message, error.details)
    }

    console.error('create-order failed:', error)
    return failure('CREATE_ORDER_FAILED', '创建订单失败，请稍后重试')
  }
}