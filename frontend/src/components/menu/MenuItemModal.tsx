import { useState, useEffect } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { MenuItem } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, parsePriceToCents } from '@/lib/utils'

interface MenuItemModalProps {
  item: MenuItem | null
  onClose: () => void
  restaurantId: string
}

export function MenuItemModal({ item, onClose, restaurantId }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)

  // Reset quantity when item changes
  useEffect(() => {
    setQuantity(1)
  }, [item])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (item) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [item, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [item])

  if (!item) return null

  const priceCents = parsePriceToCents(item.price)
  const totalCents = priceCents * quantity

  const handleAddToCart = () => {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        priceCents,
        quantity,
      },
      restaurantId
    )
    toast.success(`${item.name} added to cart!`)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          {/* Image */}
          {item.imageUrl ? (
            <div className="aspect-video overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <span className="text-6xl" role="img" aria-hidden="true">
                🍴
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>

          {/* Content */}
          <div className="p-5">
            <div className="mb-4">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                {item.name}
              </h2>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              )}
              <p className="text-lg font-semibold text-orange-600 mt-2">
                {formatPrice(priceCents)} each
              </p>
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {item.isAvailable ? (
                <>
                  Add to Cart &mdash; {formatPrice(totalCents)}
                </>
              ) : (
                'Item Unavailable'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
