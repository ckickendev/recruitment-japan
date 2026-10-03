'use client'

import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react'
import type { Category } from '@/types/database'

interface JobSearchBarProps {
  jobCategories: Category[]
  locations: Category[]
  defaultSearch?: string
  defaultCategory?: string
  defaultLocation?: string
}

export function JobSearchBar({
  jobCategories,
  locations,
  defaultSearch = '',
  defaultCategory = '',
  defaultLocation = '',
}: JobSearchBarProps) {
  return (
    <form
      action="/tin-tuyen-dung"
      method="GET"
      className="w-full rounded-2xl border border-border/80 bg-card p-2.5 sm:p-3 shadow-xl backdrop-blur-xl transition-all"
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Keyword Search Input */}
        <div className="relative sm:col-span-5 flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={defaultSearch}
            placeholder="Tìm theo vị trí, kỹ năng, chức danh..."
            className="w-full h-11 rounded-xl border border-border/70 bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
          />
        </div>

        {/* Job Category Select */}
        <div className="relative sm:col-span-3 flex items-center">
          <Briefcase className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            name="category"
            defaultValue={defaultCategory}
            className="w-full h-11 appearance-none rounded-xl border border-border/70 bg-background pl-10 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all cursor-pointer"
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
        <div className="relative sm:col-span-2 flex items-center">
          <MapPin className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            name="location"
            defaultValue={defaultLocation}
            className="w-full h-11 appearance-none rounded-xl border border-border/70 bg-background pl-10 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all cursor-pointer"
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

        {/* Search Submit Button */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>Tìm Việc</span>
          </button>
        </div>
      </div>
    </form>
  )
}
