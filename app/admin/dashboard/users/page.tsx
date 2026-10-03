import Link from 'next/link'
import {
  Users,
  UserPlus,
  Shield,
  Edit3,
  UserCheck,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/roles'
import { createAdminClient } from '@/lib/supabase/server'
import { UserActions } from '@/components/admin/UserActions'
import { formatDate } from '@/lib/utils'
import type { Profile, UserRole } from '@/types/database'

export default async function AdminUsersPage() {
  const currentAuth = await requireAdmin()
  const adminSupabase = createAdminClient()

  // 1. Fetch all users from Supabase Auth & public.profiles
  const [{ data: authUsersData }, { data: profilesData }] = await Promise.all([
    adminSupabase.auth.admin.listUsers({ perPage: 100 }),
    adminSupabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ])

  const authUsers = authUsersData?.users || []
  const profiles = (profilesData as Profile[]) || []

  // Combine auth user data (email) with profile data (full_name, phone, role)
  const usersList = authUsers.map((authUser) => {
    const profile = profiles.find((p) => p.id === authUser.id)
    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: profile?.full_name || (authUser.user_metadata?.full_name as string) || authUser.email || 'Chưa đặt tên',
      phone: profile?.phone || (authUser.user_metadata?.phone as string) || null,
      role: (profile?.role || (authUser.user_metadata?.role as UserRole) || 'user') as UserRole,
      created_at: profile?.created_at || authUser.created_at,
    }
  })

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Quản Trị Viên (Admin)',
          color: 'bg-red-500/15 text-red-400 border-red-500/30',
          icon: Shield,
        }
      case 'editor':
        return {
          label: 'Biên Tập Viên (Editor)',
          color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: Edit3,
        }
      default:
        return {
          label: 'Nhân Viên (Staff)',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: UserCheck,
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Quản Lý Thành Viên &amp; Phân Quyền
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống phân quyền Role-Based Access Control (Admin, Editor, Staff/User)
          </p>
        </div>

        <Link
          href="/admin/dashboard/users/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 shadow-md shadow-red-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Thêm Thành Viên Mới</span>
        </Link>
      </div>

      {/* Permissions Guide Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-400">
            <Shield className="h-4 w-4" />
            <span>Admin (Super Admin)</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Toàn quyền CRUD việc làm, quản trị tài khoản thành viên và toàn bộ thông tin liên hệ.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-400">
            <Edit3 className="h-4 w-4" />
            <span>Editor (Nội dung)</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Tạo, biên tập, xuất bản tin việc làm. Không có quyền quản trị tài khoản hoặc xóa tin người khác.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <span>Staff / Recruiter (User)</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Tiếp nhận và xử lý yêu cầu tư vấn ứng viên được phân công. Quyền xem việc làm cơ bản.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Họ và tên</th>
                <th className="px-5 py-3.5">Email &amp; Liên hệ</th>
                <th className="px-5 py-3.5">Vai trò (Role)</th>
                <th className="px-5 py-3.5">Ngày tham gia</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {usersList.length > 0 ? (
                usersList.map((user) => {
                  const roleBadge = getRoleBadge(user.role)
                  const RoleIcon = roleBadge.icon
                  const isSelf = user.id === currentAuth.userId

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{user.full_name}</span>
                          {isSelf && (
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                              Bạn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="h-3 w-3 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <Phone className="h-3 w-3 text-slate-500" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${roleBadge.color}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <UserActions
                          userId={user.id}
                          userName={user.full_name}
                          currentRole={user.role}
                          currentUserId={currentAuth.userId}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không có thành viên nào.
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
