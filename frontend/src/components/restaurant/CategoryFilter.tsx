import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  active: string | null
  onChange: (category: string | null) => void
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  if (categories.length === 0) return null

  const allCategories = [null, ...categories]

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="tablist"
      aria-label="Filter by category"
    >
      {allCategories.map((category) => {
        const label = category ?? 'All'
        const isActive = active === category
        return (
          <button
            key={label}
            onClick={() => onChange(category)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              isActive
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
