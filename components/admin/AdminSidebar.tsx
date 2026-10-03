'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Users,
  MessageSquare,
  Globe,
  LogOut,
  ExternalLink,
  Shield,
  UserCheck,
  Edit3,
  Loader2,
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface AdminSidebarProps {
  profile: Profile
  email: string
  isAdmin: boolean
}

export function AdminSidebar({ profile, email, isAdmin }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const navItems = [
    {
      label: 'Quản lý việc làm',
      href: '/admin/dashboard/jobs',
      icon: Briefcase,
      visible: true,
    },
    {
      label: 'Quản lý người dùng',
      href: '/admin/dashboard/users',
      icon: Users,
      visible: isAdmin, // Only visible to admin role
    },
    {
      label: 'Yêu cầu tư vấn',
      href: '/admin/dashboard/contacts',
      icon: MessageSquare,
      visible: true,
    },
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Quản Trị Viên',
          color: 'bg-red-500/15 text-red-400 border-red-500/30',
          icon: Shield,
        }
      case 'editor':
        return {
          label: 'Biên Tập Viên',
          color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: Edit3,
        }
      default:
        return {
          label: 'Nhân Viên',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: UserCheck,
        }
    }
  }

  const roleInfo = getRoleBadge(profile.role)
  const RoleIcon = roleInfo.icon

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutAction('/admin/login')
    })
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-800 bg-slate-950 text-slate-200 min-h-screen p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/admin/dashboard/jobs" className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-md shadow-red-600/30">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white">
              GLOBAL <span className="text-red-500">CAREER GATE</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            Menu Quản Trị
          </div>

          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

          <div className="pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            Hệ Thống
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" />
              <span>Xem Website</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
          </Link>
        </nav>
      </div>

      {/* User Footer Profile & Sign Out Button */}
      <div className="border-t border-slate-800/80 pt-4 space-y-3">
        <div className="px-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white line-clamp-1">
              {profile.full_name}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
                roleInfo.color
              )}
            >
              <RoleIcon className="h-2.5 w-2.5" />
              {roleInfo.label}
            </span>
          </div>
          <div className="text-xs text-slate-400 line-clamp-1">{email}</div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-red-500/40 hover:bg-red-950/20 text-slate-400 hover:text-red-400 py-2.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang đăng xuất...</span>
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              <span>Đăng xuất</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
