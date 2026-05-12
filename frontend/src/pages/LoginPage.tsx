import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Welcome back!')
        navigate(redirectTo, { replace: true })
      },
      onError: (error) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Invalid email or password'
        toast.error(message)
      },
    })
  }

  const handleRegister = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Account created! Welcome to FoodHub!')
        navigate(redirectTo, { replace: true })
      },
      onError: (error) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Registration failed. Please try again.'
        toast.error(message)
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl" role="img" aria-label="FoodHub">
            🍽️
          </span>
          <span className="text-2xl font-bold text-gray-900">FoodHub</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  {...loginForm.register('email')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  {...registerForm.register('name')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerForm.register('email')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register('password')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-orange-500 hover:text-orange-600 font-medium">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
