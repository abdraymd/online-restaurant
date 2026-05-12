import { Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { HomePage } from '@/pages/HomePage'
import { RestaurantPage } from '@/pages/RestaurantPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { OrderHistoryPage } from '@/pages/OrderHistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
      <Routes>
        {/* Login has its own full-screen layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Main layout: Navbar + Footer wrapper */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/restaurants/:id" element={<RestaurantPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
