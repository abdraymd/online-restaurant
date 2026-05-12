import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const itemCount = useCartStore((s) => s.itemCount())
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl" role="img" aria-label="FoodHub">
                🍽️
              </span>
              <span className="text-xl font-bold text-gray-900">FoodHub</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Auth section */}
              {token && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/orders"
                    className="hidden sm:flex items-center gap-1 text-sm text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-gray-100"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
