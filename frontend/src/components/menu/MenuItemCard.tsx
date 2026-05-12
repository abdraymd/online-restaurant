import { Plus } from 'lucide-react'
import type { MenuItem } from '@/types'
import { formatPrice, parsePriceToCents } from '@/lib/utils'

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const priceCents = parsePriceToCents(item.price)

  return (
    <div className="flex gap-4 p-4 border rounded-xl bg-white hover:bg-gray-50 transition-colors">
      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
          <span className="text-2xl" role="img" aria-hidden="true">
            🍴
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
            )}
          </div>
          {!item.isAvailable && (
            <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-semibold text-orange-600">
            {formatPrice(priceCents)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.isAvailable}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 text-xs font-medium rounded-lg transition-colors"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
