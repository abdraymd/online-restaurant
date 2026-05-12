import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, getOrder, placeOrder } from '@/api/orders'
import type { PlaceOrderDto } from '@/types'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: PlaceOrderDto) => placeOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
