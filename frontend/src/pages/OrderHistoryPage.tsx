import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { formatDate, formatPrice, parsePriceToCents } from '@/lib/utils'

function OrderRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export function OrderHistoryPage() {
  const { data: orders = [], isLoading } = useOrders()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <ClipboardList className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderRowSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4" role="img" aria-hidden="true">
              🛍️
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start ordering!</p>
            <Link
              to="/"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const totalCents = parsePriceToCents(order.totalPrice)
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

              return (
                <Link
                  key={order.id}
                  to={`/orders/confirmation/${order.id}`}
                  className="block bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-base font-bold text-gray-900">
                        {formatPrice(totalCents)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {order.items
                          .map((item) => `${item.name ?? `Item #${item.menuItemId.slice(0, 6)}`} ×${item.quantity}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
