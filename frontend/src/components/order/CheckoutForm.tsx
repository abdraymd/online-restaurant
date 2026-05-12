import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const checkoutSchema = z.object({
  address: z.string().min(10, 'Please enter a complete delivery address (min 10 characters)'),
  note: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void
  isLoading: boolean
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Delivery Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          rows={3}
          placeholder="Enter your full delivery address..."
          {...register('address')}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Order Notes{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          placeholder="Any special instructions or requests..."
          {...register('note')}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="text-white" />
            Placing Order...
          </>
        ) : (
          'Place Order'
        )}
      </button>
    </form>
  )
}
