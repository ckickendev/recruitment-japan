import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Clock,
  Calendar,
  Eye,
  Briefcase,
  Gift,
  CheckCircle2,
  FileText,
  Flame,
  ChevronRight,
  BadgeDollarSign,
  PhoneCall,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { JobApplicationForm } from '@/components/jobs/JobApplicationForm'
import { JobCard } from '@/components/jobs/JobCard'
import { formatDate } from '@/lib/utils'
import type { JobWithCategory } from '@/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globalcareergate.com'

  const { data: job } = await supabase
    .from('jobs')
    .select('title, salary, location, requirements, thumbnail_url, created_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!job) {
    return {
      title: 'Không Tìm Thấy Tin Tuyển Dụng | Global Career Gate',
    }
  }

  const title = `${job.title} | Global Career Gate`
  const cleanSummary = job.requirements
    ? job.requirements.replace(/<[^>]*>?/gm, '').trim().slice(0, 160)
    : `Tuyển dụng ${job.title} tại ${job.location || 'Nhật Bản'}. Mức lương: ${job.salary || 'Hấp dẫn'}. Hỗ trợ thủ tục visa và xuất cảnh nhanh chóng.`

  const canonicalUrl = `${siteUrl}/tin-tuyen-dung/${slug}`
  const imageUrl = job.thumbnail_url || `${siteUrl}/og-default.jpg`

  return {
    title,
    description: cleanSummary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: cleanSummary,
      url: canonicalUrl,
      siteName: 'Global Career Gate',
      locale: 'vi_VN',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanSummary,
      images: [imageUrl],
    },
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Job Data by Slug
  const { data: jobData, error } = await supabase
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
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !jobData) {
    notFound()
  }

  const job = jobData as unknown as JobWithCategory

  // 2. Increment views_count asynchronously in background
  supabase
    .from('jobs')
    .update({ views_count: (job.views_count || 0) + 1 })
    .eq('id', job.id)
    .then()

  // 3. Fetch Related Jobs (same category or latest, excluding current job)
  let relatedQuery = supabase
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
    `
    )
    .eq('status', 'published')
    .neq('id', job.id)
    .order('created_at', { ascending: false })
    .limit(3)

  if (job.category_id) {
    relatedQuery = relatedQuery.eq('category_id', job.category_id)
  }

  const { data: relatedJobsData } = await relatedQuery
  const relatedJobs = (relatedJobsData as unknown as JobWithCategory[]) || []

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globalcareergate.com'

  // Structured Data (JSON-LD) for Google Jobs
  const jobBaseTimestamp = job.created_at ? new Date(job.created_at).getTime() : 1767225600000
  const validThroughDate = new Date(jobBaseTimestamp + 90 * 24 * 60 * 60 * 1000).toISOString()

  const plainDescription = (job.requirements || job.content || job.title)
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .slice(0, 1000)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: plainDescription,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Global Career Gate',
      value: job.id,
    },
    datePosted: job.created_at,
    validThrough: validThroughDate,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Global Career Gate',
      sameAs: siteUrl,
      logo: `${siteUrl}/og-default.jpg`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || 'Tokyo',
        addressCountry: 'JP',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'JPY',
      value: {
        '@type': 'QuantitativeValue',
        value: job.salary || 'Thỏa thuận theo năng lực',
        unitText: 'MONTH',
      },
    },
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      {/* Google JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/tin-tuyen-dung" className="hover:text-foreground transition-colors">
            Tin tuyển dụng
          </Link>
          {job.category?.name && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/tin-tuyen-dung?category=${job.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {job.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium line-clamp-1 max-w-[280px] sm:max-w-md">
            {job.title}
          </span>
        </nav>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN CONTENT AREA (~70% width, 8 columns) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Header Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
              {/* Category, Hot badge & Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {job.category?.name && (
                    <span className="rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-3 py-1 font-semibold">
                      {job.category.name}
                    </span>
                  )}
                  {job.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white px-2.5 py-1 font-bold shadow-xs">
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      Tuyển gấp / HOT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  {job.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(job.created_at)}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{(job.views_count || 0) + 1} lượt xem</span>
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-snug">
                {job.title}
              </h1>

              {/* Key Summary Metadata Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Salary */}
                <div className="rounded-xl border border-red-500/20 bg-red-50/60 dark:bg-red-950/30 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                    <BadgeDollarSign className="h-4 w-4" />
                    <span>Mức lương dự kiến</span>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-red-600 dark:text-red-400">
                    {job.salary || 'Thỏa thuận theo năng lực'}
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>Nơi làm việc</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                    {job.location || 'Nhật Bản'}
                  </div>
                </div>

                {/* Working hours */}
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span>Thời gian làm việc</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                    {job.working_hours || 'Theo quy chuẩn Nhật'}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Banner */}
            {job.thumbnail_url && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                <Image
                  src={job.thumbnail_url || fallbackThumbnail}
                  alt={job.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 750px"
                />
              </div>
            )}

            {/* Requirements & Benefits Callout Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.requirements && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>Yêu Cầu Cơ Bản</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}

              {job.benefits && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    <Gift className="h-4 w-4 text-emerald-600" />
                    <span>Chế Độ Phúc Lợi</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-300 leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </p>
                </div>
              )}
            </div>

            {/* Full HTML Description Content */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-foreground border-b border-border/70 pb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-red-600" />
                <span>Chi Tiết Công Việc & Yêu Cầu Tuyển Dụng</span>
              </h2>

              {job.content ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed prose-li:text-foreground/90 prose-img:rounded-2xl prose-a:text-red-600 prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: job.content }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Chưa có mô tả chi tiết cho công việc này. Vui lòng liên hệ chuyên viên tuyển dụng để nhận thông tin đầy đủ.
                </p>
              )}
            </div>

            {/* Employer / Contact Notes */}
            {job.contact_info && (
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <PhoneCall className="h-4 w-4 text-red-600" />
                  <span>Thông Tin Liên Hệ & Tiếp Nhận Hồ Sơ</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground font-medium whitespace-pre-line">
                  {job.contact_info}
                </p>
              </div>
            )}
          </main>

          {/* STICKY SIDEBAR (~30% width, 4 columns) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {/* Quick Consultation & Application Form */}
            <JobApplicationForm jobId={job.id} jobTitle={job.title} />

            {/* Candidate Assurance Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs text-muted-foreground shadow-xs">
              <h4 className="font-bold text-sm text-foreground">
                Quyền Lợi Ứng Viên Tại Global Career Gate
              </h4>
              <ul className="space-y-2.5">
                {[
                  '100% Đơn hàng thẩm định pháp lý và hợp đồng lao động rõ ràng.',
                  'Được hướng dẫn luyện phỏng vấn 1-1 trực tiếp cùng chuyên gia.',
                  'Hỗ trợ toàn bộ thủ tục xin tư cách lưu trú (COE) và visa Nhật.',
                  'Đại diện văn phòng tại Tokyo hỗ trợ giải quyết phát sinh 24/7.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* RELATED JOBS SECTION */}
        {relatedJobs.length > 0 && (
          <section className="pt-12 border-t border-border/60 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Việc Làm Tương Tự
                </h3>
                <p className="text-xs text-muted-foreground">
                  Các vị trí tuyển dụng khác có thể phù hợp với bạn
                </p>
              </div>
              <Link
                href="/tin-tuyen-dung"
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Xem tất cả việc làm →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((related) => (
                <JobCard key={related.id} job={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
