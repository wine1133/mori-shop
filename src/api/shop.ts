import { products as localProducts, findProduct } from '@/data/products'
import type { Address, Order, Product } from '@/types/shop'
import { assetUrl } from '@/utils/asset'

declare const uniCloud: any

const CLIENT_USER_KEY = 'mori_client_user_id'

export interface CloudOutcome<T> {
  ok: boolean
  cloudUsed: boolean
  data?: T
  message?: string
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: Array.isArray(product.images) ? product.images.map(assetUrl) : []
  }
}

function cloudAvailable() {
  return typeof uniCloud !== 'undefined' && typeof uniCloud.callFunction === 'function'
}

function cloudMode(): 'none' | 'call' | 'http' {
  let mode: 'none' | 'call' | 'http' = 'none'
  // #ifndef H5
  mode = 'call'
  // #endif
  // #ifdef H5
  const httpBase = String(import.meta.env.VITE_CLOUD_HTTP_BASE || '').trim()
  if (httpBase) {
    mode = 'http'
  } else if (import.meta.env.VITE_CLOUD_H5_CALL === 'true' && cloudAvailable()) {
    mode = 'call'
  }
  // #endif
  return mode
}

export function getClientUserId() {
  try {
    const existing = String(uni.getStorageSync(CLIENT_USER_KEY) || '')
    if (existing) return existing
    const generated = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
    uni.setStorageSync(CLIENT_USER_KEY, generated)
    return generated
  } catch {
    return `client_${Date.now().toString(36)}`
  }
}

async function callCloud<T>(name: string, data: Record<string, unknown>): Promise<CloudOutcome<T>> {
  const mode = cloudMode()
  if (mode === 'none') {
    return { ok: false, cloudUsed: false, message: '云服务未配置' }
  }

  try {
    let rawResult: unknown
    if (mode === 'http') {
      const base = String(import.meta.env.VITE_CLOUD_HTTP_BASE || '').replace(/\/$/, '')
      const response = await fetch(`${base}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        return { ok: false, cloudUsed: true, message: `云函数 HTTP ${response.status}` }
      }
      rawResult = await response.json()
    } else {
      if (!cloudAvailable()) {
        return { ok: false, cloudUsed: false, message: '当前运行环境不支持云函数' }
      }
      const response = await uniCloud.callFunction({ name, data })
      rawResult = response && response.result
    }

    let result = rawResult
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result)
      } catch {
        return { ok: false, cloudUsed: true, message: '云函数返回格式错误' }
      }
    }
    if (!result || (result as { code?: number }).code !== 0) {
      return {
        ok: false,
        cloudUsed: true,
        message: (result as { message?: string })?.message || '云函数调用失败'
      }
    }
    return { ok: true, cloudUsed: true, data: (result as { data: T }).data }
  } catch (error) {
    return {
      ok: false,
      cloudUsed: true,
      message: error instanceof Error ? error.message : '云服务连接失败'
    }
  }
}

export async function fetchProductList(params: { page?: number; pageSize?: number; category?: string } = {}) {
  const outcome = await callCloud<{ list: Product[]; total: number }>('product-list', {
    page: params.page || 1,
    pageSize: params.pageSize || 50,
    category: params.category || '全部'
  })
  if (outcome.ok && Array.isArray(outcome.data?.list)) {
    return { products: outcome.data.list.map(normalizeProduct), cloudUsed: true }
  }
  return { products: localProducts, cloudUsed: false }
}

export async function fetchProductDetail(productId: string) {
  const outcome = await callCloud<Product>('product-detail', { productId })
  if (outcome.ok && outcome.data) {
    return { product: normalizeProduct(outcome.data), cloudUsed: true }
  }
  return { product: findProduct(productId) || null, cloudUsed: false }
}

export interface RemoteOrderItem {
  productId: string
  size: string
  color: string
  quantity: number
}

export async function createRemoteOrder(
  items: RemoteOrderItem[],
  address: Address,
  userInfo: { nickname?: string } = {}
): Promise<CloudOutcome<Order>> {
  return callCloud<Order>('create-order', {
    clientUserId: getClientUserId(),
    items,
    address,
    userInfo
  })
}

export async function fetchRemoteOrders(): Promise<CloudOutcome<Order[]>> {
  const outcome = await callCloud<{ list: Order[]; total: number }>('order-list', {
    clientUserId: getClientUserId(),
    page: 1,
    pageSize: 50
  })
  if (outcome.ok) {
    return {
      ok: true,
      cloudUsed: outcome.cloudUsed,
      data: Array.isArray(outcome.data?.list) ? outcome.data.list : [],
      message: outcome.message
    }
  }
  return {
    ok: false,
    cloudUsed: outcome.cloudUsed,
    message: outcome.message
  }
}