'use client'

import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Briefcase,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { createJob, type JobActionState } from '@/app/admin/dashboard/jobs/actions'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { uploadJobImage } from '@/lib/supabase/storage'
import { slugify } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types/database'

const initialState: JobActionState = {
  success: false,
  error: null,
}

export default function CreateJobPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createJob, initialState)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isManualSlug, setIsManualSlug] = useState(false)
  const [content, setContent] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Auto-generate slug when title changes unless manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isManualSlug) {
      setSlug(slugify(val))
    }
  }

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'job_category')
        .order('name')
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  // Handle direct thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingThumbnail(true)
      const url = await uploadJobImage(file)
      setThumbnailUrl(url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh đại diện thất bại'
      alert(msg)
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Đăng Tuyển Dụng Mới
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống tự động liên kết tài khoản của bạn làm Tác giả (Author)
          </p>
        </div>

        <Link
          href="/admin/dashboard/jobs"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>Đã tạo tin việc làm thành công!</span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard/jobs')}
            className="text-xs font-bold text-white underline hover:no-underline"
          >
            Quay về danh sách
          </button>
        </div>
      )}

      {/* Main Form */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-red-500" />
            <span>Thông Tin Cơ Bản</span>
          </h3>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-slate-200">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ví dụ: Kỹ Sư Cầu Nối BrSE (Bridge Software Engineer) - Tokyo"
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs font-semibold text-slate-200">
              Đường dẫn SEO (Slug)
            </Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setIsManualSlug(true)
                setSlug(e.target.value)
              }}
              placeholder="ky-su-cau-noi-brse-tokyo"
              className="bg-slate-900 border-slate-800 text-slate-300 font-mono text-xs focus-visible:ring-red-500/50"
            />
          </div>

          {/* Category & Salary & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category_id" className="text-xs font-semibold text-slate-200">
                Ngành nghề tuyển dụng
              </Label>
              <select
                id="category_id"
                name="category_id"
                className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="">Chọn ngành nghề</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salary" className="text-xs font-semibold text-slate-200">
                Mức lương hiển thị
              </Label>
              <Input
                id="salary"
                name="salary"
                type="text"
                placeholder="Ví dụ: 30 - 45 Man/tháng"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold text-slate-200">
                Nơi làm việc
              </Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Ví dụ: Tokyo, Nhật Bản"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>
          </div>

          {/* Working hours & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="working_hours" className="text-xs font-semibold text-slate-200">
                Thời gian làm việc
              </Label>
              <Input
                id="working_hours"
                name="working_hours"
                type="text"
                placeholder="Ví dụ: 09:00 - 18:00 (Thứ 2 - Thứ 6)"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_info" className="text-xs font-semibold text-slate-200">
                Thông tin người tiếp nhận
              </Label>
              <Input
                id="contact_info"
                name="contact_info"
                type="text"
                placeholder="Hotline: 0987.654.321 | Email: hr@globalcareergate.com"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>
          </div>

          {/* Thumbnail Image Upload */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-slate-200">
              Ảnh đại diện (Thumbnail Banner)
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {thumbnailUrl ? (
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <Image
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('')}
                    className="absolute top-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white hover:bg-black"
                  >
                    Xóa
                  </button>
                </div>
              ) : null}

              <div>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-colors">
                  {isUploadingThumbnail ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Upload className="h-4 w-4 text-red-500" />
                  )}
                  <span>{thumbnailUrl ? 'Thay đổi ảnh khác' : 'Tải ảnh lên Supabase'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Định dạng: JPG, PNG, WebP (Tối đa 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements & Benefits summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Tóm Tắt Yêu Cầu &amp; Chế Độ Phúc Lợi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="requirements" className="text-xs font-semibold text-slate-200">
                Tóm tắt yêu cầu cơ bản
              </Label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                placeholder="Ví dụ: Tối thiểu 2 năm kinh nghiệm React/Node.js. Tiếng Nhật N3+..."
                className="w-full p-3 rounded-lg border border-slate-800 bg-slate-900 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="benefits" className="text-xs font-semibold text-slate-200">
                Tóm tắt chế độ phúc lợi
              </Label>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                placeholder="Ví dụ: Trợ cấp 50% nhà ở, vé máy bay, thưởng 2 lần/năm..."
                className="w-full p-3 rounded-lg border border-slate-800 bg-slate-900 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl space-y-3">
          <Label className="text-base font-bold text-white block">
            Mô Tả Chi Tiết Công Việc (Rich Text)
          </Label>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Nhập mô tả công việc, trách nhiệm, văn hóa doanh nghiệp, hỗ trợ phỏng vấn..."
            className="border-slate-800 bg-slate-900 text-white min-h-[350px]"
          />
        </div>

        {/* Status & Featured options */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                id="is_featured"
                name="is_featured"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_featured" className="text-xs font-semibold text-white cursor-pointer">
                Đánh dấu là Tin Nổi Bật (HOT)
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="status" className="text-xs font-semibold text-slate-300">
                Trạng thái:
              </Label>
              <select
                id="status"
                name="status"
                defaultValue="published"
                className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="published">Xuất bản công khai</option>
                <option value="draft">Lưu bản nháp</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard/jobs"
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 transition-colors"
            >
              Hủy
            </Link>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm px-6 h-10 shadow-md shadow-red-600/25 transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Đang xuất bản...</span>
                </>
              ) : (
                <span>Lưu &amp; Xuất Bản Tin</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
