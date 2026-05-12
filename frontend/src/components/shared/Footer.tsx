export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-semibold text-gray-900">FoodHub</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 FoodHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-orange-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-orange-500 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-orange-500 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
