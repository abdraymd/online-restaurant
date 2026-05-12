import { apiClient } from './client'
import type { MenuItem } from '@/types'

interface MenuParams {
  category?: string
}

export async function getMenuItems(
  restaurantId: string,
  params?: MenuParams
): Promise<MenuItem[]> {
  const response = await apiClient.get<MenuItem[]>(
    `/restaurants/${restaurantId}/menu`,
    { params }
  )
  return response.data
}
