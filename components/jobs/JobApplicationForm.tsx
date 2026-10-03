'use client'

import { useActionState, useState } from 'react'
import {
  Phone,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { submitJobApplication, type ApplicationState } from '@/app/(public)/tin-tuyen-dung/[slug]/actions'

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
}

const initialState: ApplicationState = {
  success: false,
  error: null,
}

export function JobApplicationForm({ jobId, jobTitle }: JobApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(submitJobApplication, initialState)
  const [isReset, setIsReset] = useState(false)

  const isSubmitted = Boolean(state?.success && !isReset)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
      {/* Form Header */}
      <div className="space-y-1.5 pb-2 border-b border-border/60">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
          <Sparkles className="h-3 w-3" />
          <span>Ứng tuyển & Tư vấn nhanh</span>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Đăng Ký Nhận Tư Vấn Đơn Này
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Để lại thông tin, chuyên viên phụ trách đơn hàng <strong>{jobTitle}</strong> sẽ liên hệ hỗ trợ bạn trong vòng 24h.
        </p>
      </div>

      {isSubmitted ? (
        <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">
              Đăng Ký Thành Công!
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Global Career Gate đã tiếp nhận thông tin của bạn cho đơn tuyển dụng này. Chuyên viên sẽ sớm liên lạc qua điện thoại/Zalo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsReset(true)}
            className="text-xs font-semibold text-red-600 hover:underline pt-2 cursor-pointer"
          >
            Gửi thêm câu hỏi hoặc thông tin khác
          </button>
        </div>
      ) : (
        <form
          action={(formData) => {
            setIsReset(false)
            formAction(formData)
          }}
          className="space-y-4"
        >
          <input type="hidden" name="job_id" value={jobId} />

          {state?.error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="Nguyễn Văn A"
              className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Số điện thoại / Zalo <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="0987654321"
              className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Email (nếu có)
            </label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Ghi chú / Trình độ tiếng Nhật
            </label>
            <textarea
              name="note"
              rows={3}
              placeholder="Ví dụ: Đã có N3, mong muốn làm việc tại Tokyo, cần tư vấn thủ tục visa..."
              className="w-full p-3 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-red-600/25 transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý hồ sơ...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Nộp Hồ Sơ / Nhận Tư Vấn</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Direct Call / Zalo Quick Buttons */}
      <div className="pt-2 border-t border-border/60 space-y-2.5">
        <div className="text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wide">
          Hoặc liên hệ hotline trực tiếp
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:0987654321"
            className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-red-500/30 bg-red-50/70 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 text-xs font-semibold transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>0987.654.321</span>
          </a>

          <a
            href="https://zalo.me/0987654321"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-blue-500/30 bg-blue-50/70 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/70 text-xs font-semibold transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Chat Zalo</span>
          </a>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-border/60 space-y-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Cam kết bảo mật thông tin cá nhân 100%</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Chuyên viên giải đáp thắc mắc trong vòng 24h</span>
        </div>
      </div>
    </div>
  )
}
