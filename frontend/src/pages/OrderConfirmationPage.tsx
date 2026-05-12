import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Home, ClipboardList } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderSummary } from '@/components/order/OrderSummary'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate, formatPrice, parsePriceToCents } from '@/lib/utils'

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = id ?? ''

  const { data: order, isLoading } = useOrder(orderId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <Link to="/" className="text-orange-500 hover:text-orange-600 font-medium">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">
            Your order has been placed and will be prepared shortly.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900">
                  {order.id}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-0.5">Placed at</p>
                <p className="text-gray-900 font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Total</p>
                <p className="text-gray-900 font-bold text-base">
                  {formatPrice(parsePriceToCents(order.totalPrice))}
                </p>
              </div>
              {order.note && (
                <div>
                  <p className="text-gray-500 mb-0.5">Note</p>
                  <p className="text-gray-900">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            <OrderSummary
              mode="order"
              items={order.items}
              totalPrice={order.totalPrice}
            />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            View Order History
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Order More Food
          </Link>
        </div>
      </div>
    </div>
  )
}
