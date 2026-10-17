export interface ProductColor {
  name: string
  value: string
}

export interface ProductSize {
  name: string
  stock: number
}

export interface Product {
  id: string
  name: string
  englishName: string
  subtitle: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  aspect: 'tall' | 'regular' | 'short'
  tag?: string
  rating: number
  reviews: number
  sold: number
  colors: ProductColor[]
  sizes: ProductSize[]
  description: string
  material: string
  care: string
}

export interface CartItem {
  key: string
  productId: string
  name: string
  englishName: string
  image: string
  price: number
  size: string
  color: string
  colorValue: string
  quantity: number
  selected: boolean
}

export interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
}

export interface Order {
  id: string
  status: 'pending_payment' | 'processing' | 'shipped' | 'completed'
  statusText: string
  items: OrderItem[]
  total: number
  createdAt: string
  address: string
}

export interface Address {
  name: string
  phone: string
  region: string
  detail: string
  isDefault: boolean
}