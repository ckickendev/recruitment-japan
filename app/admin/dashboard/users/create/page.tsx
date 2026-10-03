'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { createUser, type UserActionState } from '@/app/admin/dashboard/users/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: UserActionState = {
  success: false,
  error: null,
}

export default function CreateUserPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUser, initialState)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Thêm Thành Viên Mới
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Tạo tài khoản và phân quyền truy cập hệ thống quản trị
          </p>
        </div>

        <Link
          href="/admin/dashboard/users"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl space-y-6">
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
              <span>Đã tạo tài khoản thành viên thành công!</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/users')}
              className="text-xs font-bold text-white underline hover:no-underline"
            >
              Xem danh sách
            </button>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-200">
              Địa chỉ Email đăng nhập <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="staff@globalcareergate.com"
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-200">
              Mật khẩu tạm thời <span className="text-red-500">*</span> (tối thiểu 6 ký tự)
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
              />
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold text-slate-200">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-200">
                Số điện thoại
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0987654321"
                  className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50"
                />
              </div>
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-semibold text-slate-200">
              Vai trò &amp; Phân quyền (Role) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                id="role"
                name="role"
                defaultValue="user"
                required
                className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
              >
                <option value="user">Nhân Viên / Tuyển Dụng (User/Staff) - Quản lý liên hệ ứng viên</option>
                <option value="editor">Biên Tập Viên (Editor) - Tạo &amp; Biên tập tin việc làm</option>
                <option value="admin">Quản Trị Viên (Admin) - Toàn quyền hệ thống &amp; Quản trị người dùng</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Link
              href="/admin/dashboard/users"
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
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Xác Nhận Tạo Thành Viên</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
