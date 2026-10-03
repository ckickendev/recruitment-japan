"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Phone,
  Menu,
  X,
  ArrowRight,
  Globe,
  LayoutDashboard,
  LogOut,
  Shield,
  Loader2,
  Lock,
} from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import type { UserAuthContext } from "@/lib/supabase/roles"

const NAV_ITEMS = [
  { label: "Trang Chủ", href: "/" },
  { label: "Việc Làm", href: "/tin-tuyen-dung" },
  { label: "Ngành Nghề", href: "/categories" },
  { label: "Liên Hệ", href: "/contact" },
]

interface HeaderProps {
  authUser?: UserAuthContext | null
}

export function Header({ authUser }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isPendingLogout, startLogoutTransition] = useTransition()
  const pathname = usePathname()

  const handleOpenConsultation = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-consultation-modal"))
    }
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction("/")
    })
  }

  const canAccessAdmin = authUser && (authUser.isAdmin || authUser.isEditor || authUser.isUser)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all">
      <div className="container mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-500 to-amber-500 text-white shadow-md shadow-red-500/20">
            <Globe className="h-6 w-6 transition-transform group-hover:rotate-12 duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-foreground sm:text-xl">
              GLOBAL <span className="text-red-600 dark:text-red-500">CAREER GATE</span>
            </span>
            <span className="text-[10px] sm:text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Cổng Cơ Hội Việc Làm Nhật Bản
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/30 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Click to Call Hotline */}
          <a
            href="tel:0987654321"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/70 hover:border-red-500/40 text-sm font-medium text-foreground hover:text-red-600 transition-colors group"
            title="Gọi Hotline tư vấn"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <div className="text-left leading-tight pr-1">
              <div className="text-[10px] text-muted-foreground font-normal">Hotline 24/7</div>
              <div className="font-semibold text-xs tracking-wide">0987.654.321</div>
            </div>
          </a>

          {/* User Auth Section or Default CTA */}
          {authUser ? (
            <div className="relative flex items-center gap-2 pl-1">
              {/* Quick Admin Portal Link if Admin/Editor */}
              {canAccessAdmin && (
                <Link
                  href="/admin/dashboard/jobs"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 text-xs font-semibold transition-colors"
                  title="Truy cập Bảng điều khiển quản trị"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Trang Quản Trị</span>
                </Link>
              )}

              {/* User Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-background hover:bg-muted p-1 pr-3 text-xs font-medium text-foreground transition-colors cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px]">
                    {authUser.profile.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="line-clamp-1 max-w-[100px] font-semibold">
                    {authUser.profile.full_name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-50 duration-150 z-50">
                    <div className="px-3 py-2 border-b border-border/60">
                      <div className="font-bold text-xs text-foreground truncate">
                        {authUser.profile.full_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {authUser.email}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-muted text-foreground uppercase">
                        <Shield className="h-2.5 w-2.5 text-red-600" />
                        <span>{authUser.profile.role}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {canAccessAdmin && (
                        <Link
                          href="/admin/dashboard/jobs"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-red-600" />
                          <span>Bảng điều khiển Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-border/60">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isPendingLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isPendingLogout ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5" />
                        )}
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Consultation CTA */}
              <button
                type="button"
                onClick={handleOpenConsultation}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 text-sm font-medium shadow-sm shadow-red-600/25 transition-all hover:shadow-md hover:shadow-red-600/30 cursor-pointer"
              >
                <span>Nhận Tư Vấn</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Discreet Admin Login */}
              <Link
                href="/admin/login"
                title="Dành cho Quản trị viên & Nhân viên"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Lock className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="tel:0987654321"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
            aria-label="Gọi hotline"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-foreground hover:bg-muted focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* User profile card if logged in on mobile */}
          {authUser && (
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
                    {authUser.profile.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-foreground">
                      {authUser.profile.full_name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {authUser.email}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                  {authUser.profile.role}
                </span>
              </div>

              {canAccessAdmin && (
                <Link
                  href="/admin/dashboard/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 font-semibold text-xs border border-red-500/20"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Truy Cập Trang Quản Trị</span>
                </Link>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-semibold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="pt-3 border-t border-border/60 flex flex-col gap-2.5">
            <a
              href="tel:0987654321"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:bg-muted"
            >
              <Phone className="h-4 w-4 text-red-600" />
              <span>Hotline: 0987.654.321</span>
            </a>

            {!authUser && (
              <button
                type="button"
                onClick={handleOpenConsultation}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm shadow-sm hover:bg-red-700 cursor-pointer"
              >
                <span>Nhận Tư Vấn Miễn Phí</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {authUser ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPendingLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-red-600 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer disabled:opacity-50"
              >
                {isPendingLogout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Đăng nhập dành cho Quản trị viên</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
