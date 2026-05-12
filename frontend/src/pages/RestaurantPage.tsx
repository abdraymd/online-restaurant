import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, ArrowLeft, Clock } from 'lucide-react'
import { useRestaurant } from '@/hooks/useRestaurants'
import { useMenuItems } from '@/hooks/useMenu'
import { CategoryFilter } from '@/components/restaurant/CategoryFilter'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuItemModal } from '@/components/menu/MenuItemModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { MenuItem } from '@/types'
import { cn } from '@/lib/utils'

export function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = id ?? ''

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(restaurantId)
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems(restaurantId)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    menuItems.forEach((item) => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats).sort()
  }, [menuItems])

  const filteredItems = useMemo(() => {
    if (!activeCategory) return menuItems
    return menuItems.filter((item) => item.category === activeCategory)
  }, [menuItems, activeCategory])

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item)
  }

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl" role="img" aria-hidden="true">
          🔍
        </span>
        <h2 className="text-xl font-semibold text-gray-900">Restaurant not found</h2>
        <Link to="/" className="text-orange-500 hover:text-orange-600 font-medium">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to restaurants
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
          {/* Hero image */}
          <div className="aspect-[3/1] sm:aspect-[4/1] overflow-hidden bg-gray-100">
            {restaurant.imageUrl ? (
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <span className="text-7xl" role="img" aria-hidden="true">
                  🍽️
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                {restaurant.description && (
                  <p className="text-gray-500 mt-1 max-w-xl">{restaurant.description}</p>
                )}
              </div>
              <span
                className={cn(
                  'self-start shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                  restaurant.isOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                {restaurant.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                {restaurant.address}
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-orange-400" />
                  {restaurant.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        )}

        {/* Menu items */}
        {menuLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block" role="img" aria-hidden="true">
              📋
            </span>
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          <div>
            {activeCategory ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeCategory}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Group by category when showing all
              categories.length > 0 ? (
                <div className="space-y-8">
                  {/* Uncategorized items */}
                  {filteredItems.filter((i) => !i.category).length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredItems
                          .filter((i) => !i.category)
                          .map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {categories.map((cat) => {
                    const catItems = filteredItems.filter((i) => i.category === cat)
                    if (catItems.length === 0) return null
                    return (
                      <div key={cat}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{cat}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {catItems.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        restaurantId={restaurantId}
      />
    </div>
  )
}
