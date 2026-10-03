'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { deleteJob, toggleJobStatus } from '@/app/admin/dashboard/jobs/actions'
import type { JobStatus } from '@/types/database'

interface JobTableActionsProps {
  jobId: string
  jobTitle: string
  jobSlug: string
  jobStatus: JobStatus
  authorId: string | null
  currentUserId: string
  isAdmin: boolean
  isEditor: boolean
}

export function JobTableActions({
  jobId,
  jobTitle,
  jobSlug,
  jobStatus,
  authorId,
  currentUserId,
  isAdmin,
  isEditor,
}: JobTableActionsProps) {
  const [isPending, startTransition] = useTransition()

  // Permission: Admin can delete any job; Editor can only delete their own
  const canDelete = isAdmin || (isEditor && authorId === currentUserId)
  const canEdit = isAdmin || isEditor

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleJobStatus(jobId, jobStatus)
      if (res?.error) {
        alert(res.error)
      }
    })
  }

  const handleDelete = () => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa tin việc làm của thành viên khác.')
      return
    }

    const confirmed = confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${jobTitle}"?`)
    if (!confirmed) return

    startTransition(async () => {
      const res = await deleteJob(jobId)
      if (res?.error) {
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* View Public Page */}
      <Link
        href={`/tin-tuyen-dung/${jobSlug}`}
        target="_blank"
        title="Xem trang hiển thị công khai"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>

      {/* Toggle Published / Draft Status */}
      {canEdit && (
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isPending}
          title={jobStatus === 'published' ? 'Chuyển về bản nháp' : 'Xuất bản tin'}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            jobStatus === 'published'
              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20'
              : 'border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : jobStatus === 'published' ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Edit Job */}
      {canEdit && (
        <Link
          href={`/admin/dashboard/jobs/${jobId}/edit`}
          title="Chỉnh sửa tin"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-950/20 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Link>
      )}

      {/* Delete Job */}
      {canDelete ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title="Xóa tin tuyển dụng"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition-colors cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          disabled
          title="Chỉ Admin hoặc người tạo mới có quyền xóa"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/40 text-slate-700 cursor-not-allowed"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
