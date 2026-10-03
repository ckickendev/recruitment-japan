'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Globe, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { loginAdmin, type LoginActionState } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const initialState: LoginActionState = {
  error: null,
}

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/30">
              <Globe className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              GLOBAL <span className="text-red-500">CAREER GATE</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            Hệ thống Quản trị Tuyển dụng & Nội dung (Admin CMS)
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl text-white">Đăng Nhập Quản Trị</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Nhập thông tin tài khoản để truy cập hệ thống điều hành
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-200">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@globalcareergate.com"
                    className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50 focus-visible:border-red-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-200">
                    Mật khẩu
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-500/50 focus-visible:border-red-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm h-10 shadow-lg shadow-red-600/25 transition-all mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>Đăng Nhập Quản Trị</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex items-center justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại trang chủ website</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
