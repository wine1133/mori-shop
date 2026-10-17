import assert from 'node:assert/strict'
import { createRequire, _initPaths } from 'node:module'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const root = resolve(process.cwd())
process.env.NODE_PATH = resolve(root, 'uniCloud-aliyun/cloudfunctions/common')
_initPaths()
const require = createRequire(import.meta.url)

const shared = require('mori-shared')
const seedProducts = JSON.parse(
  readFileSync(resolve(root, 'uniCloud-aliyun/cloudfunctions/seed-products/products.json'), 'utf8')
)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createFakeDatabase() {
  const products = new Map(seedProducts.map((product) => [product._id, clone(product)]))
  const orders = []

  function makeCollection(name) {
    return {
      where(where = {}) {
        const state = { where, orderField: null, order: 'asc', skip: 0, limit: 100 }
        const query = {
          orderBy(field, direction) {
            state.orderField = field
            state.order = direction
            return query
          },
          skip(value) {
            state.skip = value
            return query
          },
          limit(value) {
            state.limit = value
            return query
          },
          async get() {
            const source = name === 'mori-products' ? [...products.values()] : orders
            let rows = source.filter((row) =>
              Object.entries(state.where).every(([key, value]) => row[key] === value)
            )
            if (state.orderField) {
              rows = rows.sort((a, b) => {
                const left = a[state.orderField]
                const right = b[state.orderField]
                return state.order === 'desc' ? Number(right) - Number(left) : Number(left) - Number(right)
              })
            }
            return { data: clone(rows.slice(state.skip, state.skip + state.limit)) }
          },
          async count() {
            const source = name === 'mori-products' ? [...products.values()] : orders
            return {
              total: source.filter((row) =>
                Object.entries(state.where).every(([key, value]) => row[key] === value)
              ).length
            }
          }
        }
        return query
      },
      doc(id) {
        return {
          async get() {
            const row = name === 'mori-products' ? products.get(id) : orders.find((order) => order._id === id)
            return { data: row ? [clone(row)] : [] }
          },
          async update(payload) {
            if (name !== 'mori-products' || !products.has(id)) return { updated: 0 }
            products.set(id, { ...products.get(id), ...clone(payload) })
            return { updated: 1 }
          },
          async set(payload) {
            if (name === 'mori-products') products.set(id, { _id: id, ...clone(payload) })
            return { updated: 1 }
          }
        }
      },
      async add(payload) {
        const id = payload._id || `fake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        if (name === 'mori-products') {
          products.set(id, { _id: id, ...clone(payload) })
        } else {
          orders.push({ _id: id, ...clone(payload) })
        }
        return { id }
      }
    }
  }

  const db = {
    collection: makeCollection,
    async startTransaction() {
      return {
        collection: makeCollection,
        async commit() {},
        async rollback() {}
      }
    }
  }
  return { db, products, orders }
}

const fake = createFakeDatabase()
globalThis.uniCloud = { database: () => fake.db }

const { normalizeItems, buildOrderDraft, resolveUserId } = shared
assert.equal(resolveUserId({ OPENID: 'wx-openid-1' }, { clientUserId: 'web-1' }), 'wx-openid-1')
assert.equal(resolveUserId({}, { clientUserId: 'web-1' }), 'web-1')

const normalized = normalizeItems({
  items: [
    { productId: 'P02', size: 'M', color: '苔绿', quantity: 1 },
    { productId: 'P02', size: 'M', color: '苔绿', quantity: 2 }
  ]
})
assert.deepEqual(normalized, [{ productId: 'P02', size: 'M', color: '苔绿', quantity: 3 }])

const draft = buildOrderDraft([seedProducts[1]], normalized)
assert.equal(draft.total, 469 * 3)
assert.equal(draft.items[0].price, 469)
assert.equal(draft.stockUpdates[0].sizes.find((size) => size.name === 'M').stock, 4)

assert.throws(
  () => buildOrderDraft([seedProducts[1]], [{ productId: 'P02', size: 'M', color: '苔绿', quantity: 99 }]),
  (error) => error.code === 'OUT_OF_STOCK'
)

const productList = require(resolve(root, 'uniCloud-aliyun/cloudfunctions/product-list/index.js'))
const productDetail = require(resolve(root, 'uniCloud-aliyun/cloudfunctions/product-detail/index.js'))
const createOrder = require(resolve(root, 'uniCloud-aliyun/cloudfunctions/create-order/index.js'))
const orderList = require(resolve(root, 'uniCloud-aliyun/cloudfunctions/order-list/index.js'))
const seed = require(resolve(root, 'uniCloud-aliyun/cloudfunctions/seed-products/index.js'))

const listResult = await productList.main({ page: 1, pageSize: 50 })
assert.equal(listResult.code, 0)
assert.equal(listResult.data.list.length, 12)
assert.equal(listResult.data.list[0].id, 'P01')

const detailResult = await productDetail.main({ productId: 'P01' })
assert.equal(detailResult.code, 0)
assert.equal(detailResult.data.name, '雾岸 · 轻羊毛廓形大衣')

const createResult = await createOrder.main(
  {
    clientUserId: 'test-web-user',
    items: [{ productId: 'P01', size: 'S', color: '燕麦', quantity: 2 }],
    address: {
      name: '测试用户',
      phone: '13800000000',
      region: '上海市 徐汇区',
      detail: '测试路 1 号'
    }
  },
  {}
)
assert.equal(createResult.code, 0)
assert.equal(createResult.data.total, 2598)
assert.equal(createResult.data.status, 'pending_payment')
assert.equal(createResult.data.paymentStatus, 'unpaid')
assert.equal(createResult.data.items[0].price, 1299)
const stockAfterOrder = fake.products.get('P01').sizes.find((size) => size.name === 'S').stock
assert.equal(stockAfterOrder, 1)

const ordersResult = await orderList.main({ clientUserId: 'test-web-user' }, {})
assert.equal(ordersResult.code, 0)
assert.equal(ordersResult.data.list.length, 1)
assert.equal(ordersResult.data.list[0].id, createResult.data.id)

const otherOrders = await orderList.main({ clientUserId: 'another-user' }, {})
assert.equal(otherOrders.code, 0)
assert.equal(otherOrders.data.list.length, 0)

const seedResult = await seed.main({})
assert.equal(seedResult.code, 0)
assert.equal(seedResult.data.total, 12)

console.log(JSON.stringify({
  ok: true,
  checks: 20,
  productCount: listResult.data.total,
  orderNo: createResult.data.id,
  orderTotal: createResult.data.total,
  paymentStatus: createResult.data.paymentStatus,
  stockAfterOrder
}, null, 2))