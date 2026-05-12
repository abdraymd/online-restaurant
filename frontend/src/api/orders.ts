import { apiClient } from './client'
import type { Order, PlaceOrderDto } from '@/types'

export async function placeOrder(dto: PlaceOrderDto): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', dto)
  return response.data
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders')
  return response.data
}

export async function getOrder(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${id}`)
  return response.data
}
