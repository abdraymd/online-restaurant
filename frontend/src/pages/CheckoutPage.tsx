import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { usePlaceOrder } from '@/hooks/useOrders'
import { CheckoutForm, type CheckoutFormValues } from '@/components/order/CheckoutForm'
import { OrderSummary } from '@/components/order/OrderSummary'

export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const items = useCartStore((s) => s.items)
  const restaurantId = useCartStore((s) => s.restaurantId)
  const totalCents = useCartStore((s) => s.totalCents())
  const clearCart = useCartStore((s) => s.clearCart)
  const placeOrderMutation = usePlaceOrder()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-4">
            Add some items to your cart before checking out.
          </p>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (values: CheckoutFormValues) => {
    if (!token) {
      toast.info('Please sign in to place an order.')
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }

    if (!restaurantId) {
      toast.error('Something went wrong. Please try again.')
      return
    }

    placeOrderMutation.mutate(
      {
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        note: values.note || undefined,
      },
      {
        onSuccess: (order) => {
          clearCart()
          toast.success('Order placed successfully!')
          navigate(`/orders/confirmation/${order.id}`)
        },
        onError: (error) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || 'Failed to place order. Please try again.'
          toast.error(message)
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Delivery Details
            </h2>
            <CheckoutForm
              onSubmit={handleSubmit}
              isLoading={placeOrderMutation.isPending}
            />
          </div>

          {/* Right: Summary */}
          <div className="space-y-4">
            <OrderSummary mode="cart" items={items} totalCents={totalCents} />
            <p className="text-xs text-gray-400 text-center">
              By placing your order you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
