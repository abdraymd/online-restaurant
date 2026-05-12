import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (value: string) => void
  placeholder?: string
  initialValue?: string
  className?: string
}

export function SearchBar({
  onSearch,
  placeholder = 'Search restaurants...',
  initialValue = '',
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-200 px-5 py-3 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        aria-label="Search restaurants"
      />
    </div>
  )
}
