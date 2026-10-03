'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, MapPin, Briefcase, RotateCcw, ChevronDown, X } from 'lucide-react'
import type { Category } from '@/types/database'

interface JobFilterBarProps {
  jobCategories: Category[]
  locations: Category[]
  currentSearch?: string
  currentCategory?: string
  currentLocation?: string
}

export function JobFilterBar({
  jobCategories,
  locations,
  currentSearch = '',
  currentCategory = '',
  currentLocation = '',
}: JobFilterBarProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [category, setCategory] = useState(currentCategory)
  const [location, setLocation] = useState(currentLocation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (category) params.set('category', category)
    if (location) params.set('location', location)

    const query = params.toString()
    router.push(query ? `/tin-tuyen-dung?${query}` : '/tin-tuyen-dung')
  }

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setLocation('')
    router.push('/tin-tuyen-dung')
  }

  const hasActiveFilters = Boolean(currentSearch || currentCategory || currentLocation)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-4 flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo chức danh, kỹ năng..."
            className="w-full h-10 rounded-xl border border-border/80 bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50"
          />
        </div>

        {/* Category Select */}
        <div className="relative sm:col-span-3 flex items-center">
          <Briefcase className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 appearance-none rounded-xl border border-border/80 bg-background pl-10 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 cursor-pointer"
          >
            <option value="">Tất cả ngành nghề</option>
            {jobCategories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Location Select */}
        <div className="relative sm:col-span-3 flex items-center">
          <MapPin className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-10 appearance-none rounded-xl border border-border/80 bg-background pl-10 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 cursor-pointer"
          >
            <option value="">Tất cả địa điểm</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>
                {loc.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>Lọc</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              title="Đặt lại bộ lọc"
              className="h-10 px-2.5 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-medium">Đang lọc theo:</span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-0.5 font-medium border border-red-200 dark:border-red-900/50">
              Từ khóa: &quot;{currentSearch}&quot;
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  const params = new URLSearchParams()
                  if (category) params.set('category', category)
                  if (location) params.set('location', location)
                  const query = params.toString()
                  router.push(query ? `/tin-tuyen-dung?${query}` : '/tin-tuyen-dung')
                }}
                className="hover:text-red-800 dark:hover:text-red-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 font-medium border border-blue-200 dark:border-blue-900/50">
              Ngành: {jobCategories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                type="button"
                onClick={() => {
                  setCategory('')
                  const params = new URLSearchParams()
                  if (search) params.set('search', search)
                  if (location) params.set('location', location)
                  const query = params.toString()
                  router.push(query ? `/tin-tuyen-dung?${query}` : '/tin-tuyen-dung')
                }}
                className="hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {currentLocation && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 font-medium border border-emerald-200 dark:border-emerald-900/50">
              Địa điểm: {locations.find((l) => l.slug === currentLocation)?.name || currentLocation}
              <button
                type="button"
                onClick={() => {
                  setLocation('')
                  const params = new URLSearchParams()
                  if (search) params.set('search', search)
                  if (category) params.set('category', category)
                  const query = params.toString()
                  router.push(query ? `/tin-tuyen-dung?${query}` : '/tin-tuyen-dung')
                }}
                className="hover:text-emerald-800 dark:hover:text-emerald-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="text-red-600 hover:underline font-medium ml-1"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}
