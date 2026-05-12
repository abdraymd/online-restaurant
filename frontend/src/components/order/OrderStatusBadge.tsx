import type { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800',
  },
  PREPARING: {
    label: 'Preparing',
    className: 'bg-orange-100 text-orange-800',
  },
  READY: {
    label: 'Ready',
    className: 'bg-green-100 text-green-800',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800',
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
