import { useNavigate } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import type { Restaurant } from '@/types'
import { cn } from '@/lib/utils'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
      className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/restaurants/${restaurant.id}`)
        }
      }}
      aria-label={`View ${restaurant.name}`}
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden bg-gray-100">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center rounded-t-2xl">
            <span className="text-5xl" role="img" aria-hidden="true">
              🍽️
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            {restaurant.name}
          </h3>
          <span
            className={cn(
              'shrink-0 text-xs font-medium px-2.5 py-1 rounded-full',
              restaurant.isOpen
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {restaurant.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {restaurant.description}
          </p>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
          {restaurant.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
