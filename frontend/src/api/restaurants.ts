import { apiClient } from './client'
import type { Restaurant, PaginatedResponse } from '@/types'

interface RestaurantParams {
  search?: string
  isOpen?: boolean
  page?: number
  limit?: number
}

export async function getRestaurants(
  params?: RestaurantParams
): Promise<PaginatedResponse<Restaurant>> {
  const response = await apiClient.get<PaginatedResponse<Restaurant>>('/restaurants', {
    params,
  })
  return response.data
}

export async function getRestaurant(id: string): Promise<Restaurant> {
  const response = await apiClient.get<Restaurant>(`/restaurants/${id}`)
  return response.data
}
