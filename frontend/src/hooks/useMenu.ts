import { useQuery } from '@tanstack/react-query'
import { getMenuItems } from '@/api/menu'

interface MenuParams {
  category?: string
}

export function useMenuItems(restaurantId: string, params?: MenuParams) {
  return useQuery({
    queryKey: ['menu', restaurantId, params],
    queryFn: () => getMenuItems(restaurantId, params),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  })
}
