import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/shared/SearchBar'
import { RestaurantGrid } from '@/components/restaurant/RestaurantGrid'
import { useRestaurants } from '@/hooks/useRestaurants'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''

  const { data, isLoading } = useRestaurants(search ? { search } : undefined)

  const restaurants = data?.data ?? []

  const handleSearch = useCallback(
    (value: string) => {
      if (value) {
        setSearchParams({ search: value })
      } else {
        setSearchParams({})
      }
    },
    [setSearchParams]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Order food from the{' '}
            <span className="text-orange-500">best restaurants</span>{' '}
            near you
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Discover amazing restaurants, browse menus, and get your favorite
            food delivered fast.
          </p>
          <div className="flex justify-center">
            <SearchBar
              onSearch={handleSearch}
              initialValue={search}
              placeholder="Search restaurants, cuisines..."
            />
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : 'All Restaurants'}
          </h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <RestaurantGrid restaurants={restaurants} isLoading={isLoading} />
      </section>
    </div>
  )
}
