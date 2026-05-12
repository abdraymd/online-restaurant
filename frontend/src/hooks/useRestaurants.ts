import { useQuery } from '@tanstack/react-query'
import { getRestaurants, getRestaurant } from '@/api/restaurants'

interface RestaurantParams {
  search?: string
  isOpen?: boolean
  page?: number
  limit?: number
}

export function useRestaurants(params?: RestaurantParams) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => getRestaurants(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurant(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
