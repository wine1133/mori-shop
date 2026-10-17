'use strict'

const COLLECTIONS = {
  products: 'mori-products',
  orders: 'mori-orders'
}

const ORDER_STATUS = {
  pendingPayment: 'pending_payment',
  processing: 'processing',
  shipped: 'shipped',
  completed: 'completed'
}

class BusinessError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.details = details || null
  }
}

function success(data, message = 'ok') {
  return { code: 0, message, data }
}

function failure(code, message, details) {
  return { code: code || 'UNKNOWN_ERROR', message: message || '服务异常', data: null, details: details || null }
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.floor(number)))
}

function mapProduct(doc) {
  if (!doc) return null
  return {
    id: doc._id,
    name: doc.name,
    englishName: doc.englishName,
    subtitle: doc.subtitle,
    price: Number(doc.price),
    originalPrice: doc.originalPrice ? Number(doc.originalPrice) : undefined,
    category: doc.category,
    images: Array.isArray(doc.images) ? doc.images : [],
    aspect: doc.aspect,
    tag: doc.tag,
    rating: Number(doc.rating || 0),
    reviews: Number(doc.reviews || 0),
    sold: Number(doc.sold || 0),
    colors: Array.isArray(doc.colors) ? doc.colors : [],
    sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
    description: doc.description || '',
    material: doc.material || '',
    care: doc.care || ''
  }
}

function mapOrder(doc) {
  if (!doc) return null
  return {
    id: doc.order_no || doc._id,
    status: doc.status,
    statusText: doc.status_text || statusText(doc.status),
    items: Array.isArray(doc.items) ? doc.items : [],
    total: Number(doc.total || 0),
    createdAt: doc.created_at_text || formatTimeText(doc.created_at || Date.now()),
    address: doc.address_text || '',
    paymentStatus: doc.payment_status || 'unpaid',
    paymentStatusText: doc.payment_status_text || '未支付'
  }
}

function statusText(status) {
  const map = {
    pending_payment: '待付款',
    processing: '待发货',
    shipped: '运输中',
    completed: '已完成'
  }
  return map[status] || '处理中'
}

function formatTimeText(timestamp) {
  const date = new Date(Number(timestamp) + 8 * 60 * 60 * 1000)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

function makeOrderNo(timestamp = Date.now()) {
  const date = new Date(Number(timestamp) + 8 * 60 * 60 * 1000)
  const pad = (value) => String(value).padStart(2, '0')
  const datePart = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
  const timePart = String(timestamp).slice(-7)
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `MR${datePart}${timePart}${randomPart}`
}

function resolveUserId(context, event) {
  const raw =
    (context && (context.OPENID || context.openid)) ||
    (event && (event.clientUserId || event.userId))
  if (!raw) {
    throw new BusinessError('MISSING_USER', '缺少用户身份，无法操作订单')
  }
  return String(raw).trim().slice(0, 128)
}

function cleanText(value, maxLength) {
  return String(value == null ? '' : value).trim().slice(0, maxLength)
}

function normalizeAddress(input) {
  const address = input || {}
  const normalized = {
    name: cleanText(address.name, 40),
    phone: cleanText(address.phone, 30),
    region: cleanText(address.region, 80),
    detail: cleanText(address.detail, 160),
    isDefault: Boolean(address.isDefault)
  }
  if (!normalized.name || !normalized.phone || !normalized.region || !normalized.detail) {
    throw new BusinessError('INVALID_ADDRESS', '请提供完整的收货地址')
  }
  return normalized
}

function normalizeItems(event) {
  const source = Array.isArray(event && event.items)
    ? event.items
    : event && event.productId
      ? [event]
      : []

  if (!source.length) {
    throw new BusinessError('INVALID_ITEMS', '订单中至少需要一件商品')
  }

  const merged = new Map()
  for (const raw of source.slice(0, 30)) {
    const productId = cleanText(raw.productId || raw.id, 64)
    const size = cleanText(raw.size, 32)
    const color = cleanText(raw.color, 32)
    const quantity = clampInteger(raw.quantity, 1, 99, 1)
    if (!productId || !size || !color) {
      throw new BusinessError('INVALID_ITEMS', '商品、尺码和颜色信息不能为空')
    }
    const key = `${productId}::${size}::${color}`
    const existing = merged.get(key)
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + quantity)
    } else {
      merged.set(key, { productId, size, color, quantity })
    }
  }
  return [...merged.values()]
}

function productByIdMap(products) {
  const map = new Map()
  products.forEach((product) => {
    if (product) map.set(product._id, product)
  })
  return map
}

function buildOrderDraft(products, items) {
  const map = productByIdMap(products)
  const orderItems = []
  const stockMap = new Map()
  let total = 0

  for (const item of items) {
    const product = map.get(item.productId)
    if (!product) {
      throw new BusinessError('PRODUCT_NOT_FOUND', `商品 ${item.productId} 不存在`)
    }
    if (product.status && product.status !== 'on_sale') {
      throw new BusinessError('PRODUCT_OFF_SALE', `${product.name} 已下架`)
    }
    const colors = Array.isArray(product.colors) ? product.colors : []
    if (colors.length && !colors.some((color) => color.name === item.color)) {
      throw new BusinessError('INVALID_COLOR', `${product.name} 不支持颜色 ${item.color}`)
    }
    const sizes = Array.isArray(product.sizes) ? product.sizes : []
    const sizeIndex = sizes.findIndex((size) => size.name === item.size)
    if (sizeIndex < 0) {
      throw new BusinessError('INVALID_SIZE', `${product.name} 不支持尺码 ${item.size}`)
    }
    if (Number(sizes[sizeIndex].stock || 0) < item.quantity) {
      throw new BusinessError('OUT_OF_STOCK', `${product.name} ${item.size} 库存不足`)
    }

    const price = Number(product.price)
    total += price * item.quantity
    orderItems.push({
      productId: product._id,
      name: product.name,
      image: Array.isArray(product.images) ? product.images[0] : '',
      price,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    })
    const updatedSizes = stockMap.get(product._id) || sizes.map((size) => ({ ...size }))
    updatedSizes[sizeIndex].stock = Number(updatedSizes[sizeIndex].stock) - item.quantity
    stockMap.set(product._id, updatedSizes)
  }

  const stockUpdates = [...stockMap.entries()].map(([productId, sizes]) => ({ productId, sizes }))
  return { items: orderItems, stockUpdates, total: Math.round(total * 100) / 100 }
}

module.exports = {
  COLLECTIONS,
  ORDER_STATUS,
  BusinessError,
  success,
  failure,
  clampInteger,
  mapProduct,
  mapOrder,
  formatTimeText,
  makeOrderNo,
  resolveUserId,
  normalizeAddress,
  normalizeItems,
  buildOrderDraft
}