import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobPaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function JobPagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: JobPaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
    if (page > 1) {
      params.set('page', String(page))
    }
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  // Generate page numbers with ellipses
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 sm:gap-2 mt-12"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted hover:border-red-500/40 transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trước</span>
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border/50 bg-card/40 px-3 text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>
      )}

      {/* Number Buttons */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-red-600 text-white shadow-md shadow-red-600/25 pointer-events-none"
                  : "border border-border bg-card text-foreground hover:bg-muted hover:border-red-500/40"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted hover:border-red-500/40 transition-colors"
          aria-label="Trang tiếp theo"
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border/50 bg-card/40 px-3 text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
          aria-label="Trang tiếp theo"
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  )
}
