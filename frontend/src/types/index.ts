export interface User {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN'
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  imageUrl?: string
  address: string
  phone?: string
  isOpen: boolean
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description?: string
  price: string
  imageUrl?: string
  isAvailable: boolean
  category?: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  unitPrice: string
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface Order {
  id: string
  userId: string
  restaurantId: string
  restaurantName?: string
  status: OrderStatus
  totalPrice: string
  note?: string
  items: OrderItem[]
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export interface CartItem {
  menuItemId: string
  name: string
  priceCents: number
  quantity: number
}

export interface PlaceOrderDto {
  restaurantId: string
  items: { menuItemId: string; quantity: number }[]
  note?: string
}

export interface AuthResponse {
  token: string
  user: User
}
