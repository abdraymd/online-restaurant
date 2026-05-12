import type { Restaurant } from '@/types'
import { RestaurantCard } from './RestaurantCard'

interface RestaurantGridProps {
  restaurants: Restaurant[]
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function RestaurantGrid({ restaurants, isLoading }: RestaurantGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4" role="img" aria-hidden="true">
          🔍
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No restaurants found
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your search or browse all restaurants
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}
