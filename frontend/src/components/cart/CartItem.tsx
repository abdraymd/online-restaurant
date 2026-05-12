import { X, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-orange-600 font-semibold">
          {formatPrice(item.priceCents)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.menuItemId, -1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3 text-gray-600" />
        </button>
        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.menuItemId, 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      <p className="text-sm font-semibold text-gray-900 w-16 text-right">
        {formatPrice(item.priceCents * item.quantity)}
      </p>

      <button
        onClick={() => removeItem(item.menuItemId)}
        className="ml-1 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        aria-label={`Remove ${item.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
