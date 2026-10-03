import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, RotateCcw, Frown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilterBar } from '@/components/jobs/JobFilterBar'
import { JobPagination } from '@/components/jobs/JobPagination'
import type { JobWithCategory, Category } from '@/types/database'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    location?: string
    featured?: string
    page?: string
  }>
}

const PAGE_SIZE = 12

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  let title = 'Tất Cả Việc Làm Nhật Bản Mới Nhất'
  if (params.search) {
    title = `Việc làm: "${params.search}"`
  }

  return {
    title: `${title} | Global Career Gate`,
    description:
      'Tổng hợp các đơn tuyển dụng kỹ sư IT, cơ khí, xây dựng, Tokutei Gino tại Nhật Bản với chế độ đãi ngộ cao và hỗ trợ visa toàn diện.',
  }
}

export default async function JobListingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // 1. Fetch Categories for Filter Options
  const [{ data: jobCategoriesData }, { data: locationsData }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('type', 'job_category')
      .order('name'),
    supabase
      .from('categories')
      .select('*')
      .eq('type', 'location')
      .order('name'),
  ])

  const jobCategories = (jobCategoriesData as Category[]) || []
  const locations = (locationsData as Category[]) || []

  // 2. Build Job Query with Dynamic Filters
  let query = supabase
    .from('jobs')
    .select(
      `
      *,
      category:categories (
        id,
        name,
        slug,
        type
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')

  // Search keyword filter (title or content)
  if (params.search?.trim()) {
    const term = params.search.trim()
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`)
  }

  // Category filter
  if (params.category) {
    const matchedCategory = jobCategories.find((c) => c.slug === params.category)
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  // Location filter
  if (params.location) {
    const matchedLocation = locations.find((l) => l.slug === params.location)
    const locationTerm = matchedLocation ? matchedLocation.name : params.location
    query = query.ilike('location', `%${locationTerm}%`)
  }

  // Featured flag filter
  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  // Order and paginate
  const { data: jobsData, count: totalCount, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching jobs:', error)
  }

  const jobs = (jobsData as unknown as JobWithCategory[]) || []
  const total = totalCount || 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Current filter labels for display
  const currentCategoryName = jobCategories.find((c) => c.slug === params.category)?.name
  const currentLocationName = locations.find((l) => l.slug === params.location)?.name

  return (
    <div className="flex flex-col min-h-screen py-10 sm:py-14 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title & Breadcrumb */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Tin tuyển dụng</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {params.search
                  ? `Kết quả tìm kiếm cho "${params.search}"`
                  : currentCategoryName
                  ? `Việc làm ngành ${currentCategoryName}`
                  : currentLocationName
                  ? `Cơ hội việc làm tại ${currentLocationName}`
                  : 'Tất Cả Tin Tuyển Dụng'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Tìm thấy <strong className="text-foreground font-bold">{total}</strong> vị trí tuyển dụng phù hợp
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3.5 py-1.5 rounded-full border border-border/60 self-start sm:self-auto">
              <Briefcase className="h-3.5 w-3.5 text-red-600" />
              <span>Cập nhật mới mỗi ngày</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <JobFilterBar
          jobCategories={jobCategories}
          locations={locations}
          currentSearch={params.search}
          currentCategory={params.category}
          currentLocation={params.location}
        />

        {/* Jobs Grid or Empty State */}
        {jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            <JobPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/tin-tuyen-dung"
              searchParams={{
                search: params.search,
                category: params.category,
                location: params.location,
                featured: params.featured,
              }}
            />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 sm:p-16 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Frown className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Không tìm thấy việc làm phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Rất tiếc, không có đơn tuyển nào khớp với tiêu chí tìm kiếm hiện tại của bạn. Vui lòng thử tìm với từ khóa khác hoặc đặt lại bộ lọc.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tin-tuyen-dung"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Đặt lại tất cả bộ lọc</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors"
              >
                <span>Nhận tư vấn vị trí khác</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
