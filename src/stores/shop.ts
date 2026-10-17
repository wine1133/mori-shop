import { computed, reactive } from 'vue'
import { findProduct } from '@/data/products'
import { createRemoteOrder, fetchRemoteOrders } from '@/api/shop'
import type { Address, CartItem, Order, OrderItem, Product } from '@/types/shop'
import { orderTime } from '@/utils/format'

const CART_KEY = 'mori_cart_v1'
const ORDER_KEY = 'mori_orders_v1'
const FAVORITE_KEY = 'mori_favorites_v1'
const ADDRESS_KEY = 'mori_address_v1'
const SEED_KEY = 'mori_demo_seeded_v1'

const defaultAddress: Address = {
  name: '林小满',
  phone: '138 0000 6621',
  region: '上海市 徐汇区',
  detail: '安福路 288 号 5 栋 1202',
  isDefault: true
}

interface ShopState {
  cart: CartItem[]
  orders: Order[]
  favorites: string[]
  address: Address
  hydrated: boolean
}

const state = reactive<ShopState>({
  cart: [],
  orders: [],
  favorites: [],
  address: { ...defaultAddress },
  hydrated: false
})

function storageGet<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : (value as T)
  } catch {
    return fallback
  }
}

function storageSet(key: string, value: unknown) {
  try {
    uni.setStorageSync(key, value)
  } catch {
    // Storage can be unavailable in private browsing; the UI still works in memory.
  }
}

function seedDemoData() {
  if (storageGet(SEED_KEY, false)) return false

  const knit = findProduct('P02')
  const bag = findProduct('P09')
  const seededCart: CartItem[] = []

  if (knit) {
    seededCart.push({
      key: `${knit.id}-M-苔绿`,
      productId: knit.id,
      name: knit.name,
      englishName: knit.englishName,
      image: knit.images[0],
      price: knit.price,
      size: 'M',
      color: '苔绿',
      colorValue: knit.colors[0].value,
      quantity: 1,
      selected: true
    })
  }

  if (bag) {
    seededCart.push({
      key: `${bag.id}-小号-月白`,
      productId: bag.id,
      name: bag.name,
      englishName: bag.englishName,
      image: bag.images[0],
      price: bag.price,
      size: '小号',
      color: '月白',
      colorValue: bag.colors[0].value,
      quantity: 1,
      selected: true
    })
  }

  const coat = findProduct('P01')
  const seedOrder: Order[] = coat
    ? [
        {
          id: 'MR26092801',
          status: 'shipped',
          statusText: '运输中',
          items: [
            {
              productId: coat.id,
              name: coat.name,
              image: coat.images[0],
              price: coat.price,
              size: 'M',
              color: '燕麦',
              quantity: 1
            }
          ],
          total: coat.price,
          createdAt: '2026-10-14 16:28',
          address: '林小满 · 138 **** 6621 · 上海市徐汇区安福路 288 号'
        }
      ]
    : []

  state.cart = seededCart
  state.orders = seedOrder
  state.favorites = ['P03']
  storageSet(CART_KEY, seededCart)
  storageSet(ORDER_KEY, seedOrder)
  storageSet(FAVORITE_KEY, state.favorites)
  storageSet(SEED_KEY, true)
  return true
}

function hydrate() {
  if (state.hydrated) return

  const seededNow = seedDemoData()
  if (!seededNow) {
    state.cart = storageGet<CartItem[]>(CART_KEY, [])
    state.orders = storageGet<Order[]>(ORDER_KEY, [])
    state.favorites = storageGet<string[]>(FAVORITE_KEY, [])
  }

  const storedAddress = storageGet<Address | null>(ADDRESS_KEY, null)
  state.address = storedAddress || { ...defaultAddress }
  state.hydrated = true
}

function persistCart() {
  storageSet(CART_KEY, state.cart.map((item) => ({ ...item })))
}

function persistOrders() {
  storageSet(ORDER_KEY, state.orders.map((order) => ({ ...order })))
}

function persistFavorites() {
  storageSet(FAVORITE_KEY, [...state.favorites])
}

function productOrderItem(product: Product, size: string, color: string, quantity: number): OrderItem {
  return {
    productId: product.id,
    name: product.name,
    image: product.images[0],
    price: product.price,
    size,
    color,
    quantity
  }
}

function rememberOrder(order: Order) {
  state.orders = [order, ...state.orders.filter((item) => item.id !== order.id)]
  persistOrders()
  return order
}

function createOrderItems(items: OrderItem[]): Order {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const now = new Date()
  const order: Order = {
    id: `MR${String(now.getTime()).slice(-8)}`,
    status: 'pending_payment',
    statusText: '待付款',
    items,
    total,
    createdAt: orderTime(now),
    address: `${state.address.name} · ${state.address.phone} · ${state.address.region}${state.address.detail}`
  }
  return rememberOrder(order)
}

export function useShop() {
  hydrate()

  const cartCount = computed(() => state.cart.reduce((sum, item) => sum + item.quantity, 0))
  const cartTotal = computed(() =>
    state.cart.reduce((sum, item) => sum + (item.selected ? item.price * item.quantity : 0), 0)
  )
  const selectedCount = computed(() =>
    state.cart.reduce((sum, item) => sum + (item.selected ? item.quantity : 0), 0)
  )
  const allSelected = computed(
    () => state.cart.length > 0 && state.cart.every((item) => item.selected)
  )

  function addToCart(product: Product, size: string, color: string, colorValue: string, quantity = 1) {
    const key = `${product.id}-${size}-${color}`
    const existing = state.cart.find((item) => item.key === key)
    if (existing) {
      existing.quantity += quantity
      existing.selected = true
    } else {
      state.cart.unshift({
        key,
        productId: product.id,
        name: product.name,
        englishName: product.englishName,
        image: product.images[0],
        price: product.price,
        size,
        color,
        colorValue,
        quantity,
        selected: true
      })
    }
    persistCart()
  }

  function updateQuantity(key: string, quantity: number) {
    const item = state.cart.find((entry) => entry.key === key)
    if (!item) return
    item.quantity = Math.max(1, Math.min(99, quantity))
    persistCart()
  }

  function removeItem(key: string) {
    const index = state.cart.findIndex((item) => item.key === key)
    if (index >= 0) state.cart.splice(index, 1)
    persistCart()
  }

  function toggleItem(key: string) {
    const item = state.cart.find((entry) => entry.key === key)
    if (!item) return
    item.selected = !item.selected
    persistCart()
  }

  function toggleAll() {
    const next = !allSelected.value
    state.cart.forEach((item) => {
      item.selected = next
    })
    persistCart()
  }

  async function buyNow(product: Product, size: string, color: string, quantity: number) {
    const remote = await createRemoteOrder(
      [{ productId: product.id, size, color, quantity }],
      state.address,
      { nickname: state.address.name }
    )

    if (remote.cloudUsed) {
      if (!remote.ok || !remote.data) {
        throw new Error(remote.message || '创建订单失败')
      }
      return rememberOrder(remote.data)
    }

    return createOrderItems([productOrderItem(product, size, color, quantity)])
  }

  async function checkoutSelected() {
    const selected = state.cart.filter((item) => item.selected)
    if (!selected.length) return null

    const remote = await createRemoteOrder(
      selected.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      })),
      state.address,
      { nickname: state.address.name }
    )

    let order: Order
    if (remote.cloudUsed) {
      if (!remote.ok || !remote.data) {
        throw new Error(remote.message || '创建订单失败')
      }
      order = rememberOrder(remote.data)
    } else {
      order = createOrderItems(
        selected.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        }))
      )
    }

    state.cart = state.cart.filter((item) => !item.selected)
    persistCart()
    return order
  }

  async function syncOrders() {
    const remote = await fetchRemoteOrders()
    if (remote.cloudUsed && remote.ok && Array.isArray(remote.data)) {
      state.orders = remote.data
      persistOrders()
      return { updated: true, count: remote.data.length }
    }
    return { updated: false, count: state.orders.length, message: remote.message }
  }

  function isFavorite(productId: string) {
    return state.favorites.includes(productId)
  }

  function toggleFavorite(productId: string) {
    const index = state.favorites.indexOf(productId)
    if (index >= 0) state.favorites.splice(index, 1)
    else state.favorites.unshift(productId)
    persistFavorites()
  }

  function updateAddress(address: Address) {
    state.address = { ...address }
    storageSet(ADDRESS_KEY, state.address)
  }

  return {
    state,
    cartCount,
    cartTotal,
    selectedCount,
    allSelected,
    addToCart,
    updateQuantity,
    removeItem,
    toggleItem,
    toggleAll,
    buyNow,
    checkoutSelected,
    syncOrders,
    isFavorite,
    toggleFavorite,
    updateAddress
  }
}