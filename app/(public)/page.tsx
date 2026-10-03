import Link from 'next/link'
import {
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  Building2,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { JobSearchBar } from '@/components/jobs/JobSearchBar'
import { JobCard } from '@/components/jobs/JobCard'
import type { JobWithCategory, Category } from '@/types/database'

export const revalidate = 60 // Revalidate page data every 60 seconds

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all home data concurrently on the server
  const [
    { data: jobCategoriesData },
    { data: locationsData },
    { data: featuredJobsData },
    { data: latestJobsData },
  ] = await Promise.all([
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
    supabase
      .from('jobs')
      .select(`
        *,
        category:categories (
          id,
          name,
          slug,
          type
        )
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('jobs')
      .select(`
        *,
        category:categories (
          id,
          name,
          slug,
          type
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(9),
  ])

  const jobCategories = (jobCategoriesData as Category[]) || []
  const locations = (locationsData as Category[]) || []
  const featuredJobs = (featuredJobsData as unknown as JobWithCategory[]) || []
  const latestJobs = (latestJobsData as unknown as JobWithCategory[]) || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO & SEARCH SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/70 via-background to-background dark:from-red-950/20 py-16 sm:py-24 border-b border-border/40">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-100/70 dark:bg-red-950/50 px-3.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span>Cổng Kết Nối Việc Làm & Kỹ Sư Nhật Bản Toàn Cầu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Khởi Đầu Sự Nghiệp{' '}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">
                Vươn Tầm Quốc Tế
              </span>
            </h1>

            {/* Sub-headline description */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Khám phá hàng trăm cơ hội việc làm chất lượng cao tại Nhật Bản dành cho Kỹ sư, Kỹ năng đặc định (Tokutei) và chuyên viên với mức đãi ngộ minh bạch, thủ tục nhanh chóng.
            </p>

            {/* Search Bar Component */}
            <div className="pt-2">
              <JobSearchBar
                jobCategories={jobCategories}
                locations={locations}
              />
            </div>

            {/* Popular quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="font-semibold text-foreground">Từ khóa tìm nhiều:</span>
              {[
                'Kỹ sư IT Tokyo',
                'Kỹ sư Cầu nối BrSE',
                'Cơ khí CAD/CAM',
                'Tokutei Nhà hàng',
                'Xây dựng Osaka',
              ].map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/tin-tuyen-dung?search=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-muted/80 px-2.5 py-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED JOBS SECTION (Tin nổi bật) */}
      <section className="py-16 sm:py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Flame className="h-4 w-4 fill-current" />
                <span>Cơ Hội Hàng Đầu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
                Việc Làm Nổi Bật (Hot Jobs)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Các vị trí tuyển dụng được tài trợ chi phí, chế độ đãi ngộ vượt trội và phỏng vấn trực tiếp
              </p>
            </div>

            <Link
              href="/tin-tuyen-dung?featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>Xem tất cả tin hot</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">
                Chưa có đơn hàng nổi bật nào được xuất bản
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Vui lòng kiểm tra lại sau hoặc truy cập mục tất cả việc làm để tìm vị trí phù hợp.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. LATEST JOBS SECTION (Tin tuyển dụng mới nhất) */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Clock className="h-4 w-4" />
                <span>Cập Nhật Liên Tục</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
                Tin Tuyển Dụng Mới Nhất
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Các đơn tuyển dụng mới nhất từ các tập đoàn và nghiệp đoàn uy tín tại Nhật Bản
              </p>
            </div>

            <Link
              href="/tin-tuyen-dung"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>Xem danh sách đầy đủ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">
                Đang cập nhật danh sách việc làm
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Hiện chưa có tin tuyển dụng nào được đăng. Bạn có thể sử dụng endpoint <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">/api/seed</code> để tạo dữ liệu mẫu.
              </p>
            </div>
          )}

          {/* CTA: Xem tất cả tin tuyển dụng */}
          <div className="mt-12 text-center">
            <Link
              href="/tin-tuyen-dung"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 px-7 py-3.5 text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              <span>Xem tất cả tin tuyển dụng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US & RECRUITMENT PROCESS SECTION */}
      <section className="py-16 sm:py-24 bg-card border-t border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Quy Trình Chuyên Nghiệp & Minh Bạch
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Tại Sao Lựa Chọn Global Career Gate?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Lộ trình 4 bước tinh gọn giúp bạn nắm bắt cơ hội việc làm chuẩn Nhật Bản với sự an tâm tuyệt đối
            </p>
          </div>

          {/* 4-Step Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Tư Vấn & Định Hướng',
                desc: 'Đánh giá năng lực chuyên môn, trình độ ngoại ngữ và thẩm định hồ sơ 1-1 hoàn toàn miễn phí.',
                icon: Headphones,
              },
              {
                step: '02',
                title: 'Luyện Phỏng Vấn Trực Tiếp',
                desc: 'Hướng dẫn viết CV tiếng Nhật chuẩn doanh nghiệp và luyện tập phỏng vấn trực tiếp cùng chuyên gia.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Hồ Sơ Pháp Lý & Visa',
                desc: 'Cam kết minh bạch mọi chi phí, tiến độ xử lý hồ sơ COE và visa lao động chuẩn pháp lý 100%.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Xuất Cảnh & Hỗ Trợ 24/7',
                desc: 'Đón tại sân bay Nhật Bản, bố trí nơi ăn ở ổn định và đồng hành hỗ trợ trong suốt thời gian làm việc.',
                icon: Building2,
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 shadow-xs hover:shadow-md hover:border-red-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-red-600/30 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Đảm bảo chuẩn Nhật</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust Banner Callout */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Bạn chưa biết hồ sơ của mình phù hợp với đơn tuyển nào?
              </h3>
              <p className="text-xs sm:text-sm text-red-100 max-w-xl">
                Đăng ký ngay hôm nay để nhận danh sách việc làm phù hợp nhất kèm mức lương dự kiến từ chuyên viên tuyển dụng.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-xl bg-white text-red-600 hover:bg-red-50 px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              Nhận Tư Vấn Miễn Phí
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
