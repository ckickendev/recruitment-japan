import Link from 'next/link'
import Image from 'next/image'
import {
  Briefcase,
  PlusCircle,
  Eye,
  Calendar,
  Flame,
  User,
} from 'lucide-react'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { JobTableActions } from '@/components/admin/JobTableActions'
import { formatDate } from '@/lib/utils'
import type { JobWithCategory, Profile } from '@/types/database'

export default async function AdminJobsPage() {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    return null
  }

  const supabase = await createClient()

  // Fetch all jobs with joined category
  const { data: jobsData, error } = await supabase
    .from('jobs')
    .select(
      `
      *,
      category:categories (
        id,
        name,
        slug
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin jobs:', error)
  }

  // Fetch author profiles safely without crashing if FK constraint is pending
  const rawJobs = jobsData || []
  const authorIds = Array.from(
    new Set(
      rawJobs
        .map((j) => (j as { author_id?: string | null }).author_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  const profilesMap = new Map<string, Profile>()

  if (authorIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds)

    if (profilesData) {
      ;(profilesData as Profile[]).forEach((p) => profilesMap.set(p.id, p))
    }
  }

  const jobs: JobWithCategory[] = rawJobs.map((j) => ({
    ...(j as unknown as JobWithCategory),
    author: (j as { author_id?: string | null }).author_id
      ? profilesMap.get((j as { author_id: string }).author_id) || null
      : null,
  }))

  const canCreate = authContext.isAdmin || authContext.isEditor

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Quản Lý Tin Tuyển Dụng
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Danh sách tất cả các vị trí việc làm và theo dõi người tạo tin
          </p>
        </div>

        {canCreate && (
          <Link
            href="/admin/dashboard/jobs/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 shadow-md shadow-red-600/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Thêm Việc Làm Mới</span>
          </Link>
        )}
      </div>

      {/* Role Notice for User/Staff */}
      {authContext.isUser && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-300">
          Tài khoản của bạn đang có vai trò <strong>Nhân Viên (Staff)</strong> với quyền xem danh sách việc làm. Để tạo hoặc chỉnh sửa đơn hàng, vui lòng liên hệ Quản Trị Viên (Admin) cấp quyền Editor.
        </div>
      )}

      {/* Jobs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Tiêu đề việc làm</th>
                <th className="px-5 py-3.5">Ngành &amp; Địa điểm</th>
                <th className="px-5 py-3.5">Người đăng (Author)</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Lượt xem</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const isPublished = job.status === 'published'

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Job Title & Thumbnail */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {job.thumbnail_url ? (
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
                              <Image
                                src={job.thumbnail_url}
                                alt={job.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-600">
                              <Briefcase className="h-5 w-5" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="font-semibold text-white line-clamp-1 flex items-center gap-1.5">
                              <span>{job.title}</span>
                              {job.is_featured && (
                                <span title="Tin nổi bật">
                                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-current shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono line-clamp-1">
                              /{job.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-xs text-slate-300 border border-slate-800">
                            {job.category?.name || 'Chưa phân loại'}
                          </span>
                          {job.location && (
                            <div className="text-xs text-slate-400 line-clamp-1">
                              {job.location}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                          <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="font-medium text-white">
                            {job.author?.full_name || 'Hệ thống'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          <span>{isPublished ? 'Công khai' : 'Bản nháp'}</span>
                        </span>
                      </td>

                      {/* Views & Date */}
                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span>{job.views_count || 0}</span>
                          </div>
                          {job.created_at && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(job.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <JobTableActions
                          jobId={job.id}
                          jobTitle={job.title}
                          jobSlug={job.slug}
                          jobStatus={job.status}
                          authorId={job.author_id}
                          currentUserId={authContext.userId}
                          isAdmin={authContext.isAdmin}
                          isEditor={authContext.isEditor}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chưa có tin tuyển dụng nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
