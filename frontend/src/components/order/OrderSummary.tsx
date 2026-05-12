import type { CartItem, OrderItem } from '@/types'
import { formatPrice, parsePriceToCents } from '@/lib/utils'

type CartSummaryProps = {
  mode: 'cart'
  items: CartItem[]
  totalCents: number
}

type OrderDetailSummaryProps = {
  mode: 'order'
  items: OrderItem[]
  totalPrice: string
}

type OrderSummaryProps = CartSummaryProps | OrderDetailSummaryProps

export function OrderSummary(props: OrderSummaryProps) {
  if (props.mode === 'cart') {
    const { items, totalCents } = props
    return (
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items in cart</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500">×{item.quantity}</span>
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(totalCents)}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // mode === 'order'
  const { items, totalPrice } = props
  const totalCents = parsePriceToCents(totalPrice)

  return (
    <div className="bg-white border rounded-2xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Order Items</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const unitCents = parsePriceToCents(item.unitPrice)
          return (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500">×{item.quantity}</span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(unitCents * item.quantity)}
              </span>
            </div>
          )
        })}
        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>
    </div>
  )
}
