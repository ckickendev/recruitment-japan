"use client"

import { useState, useEffect } from "react"
import { Phone, MessageCircle, X, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function ContactWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    note: "",
  })

  // Listen to open-consultation-modal event triggered by Header CTA or other buttons
  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true)
    window.addEventListener("open-consultation-modal", handleOpen)
    return () => window.removeEventListener("open-consultation-modal", handleOpen)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false)
      }
    }
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contacts").insert([
        {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email ? formData.email : null,
          note: formData.note ? formData.note : null,
          status: "pending",
        },
      ])

      if (error) {
        throw error
      }

      setIsSuccess(true)
      setFormData({ full_name: "", phone: "", email: "", note: "" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại sau hoặc gọi hotline."
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsSuccess(false)
    setErrorMessage(null)
  }

  return (
    <>
      {/* Floating Action Buttons (Anchored Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Quick Consultation Modal Trigger */}
        <div className="relative group flex items-center">
          <span className="hidden group-hover:inline-flex md:inline-flex items-center mr-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md transition-all whitespace-nowrap">
            Tư vấn miễn phí
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95 transition-transform"
            aria-label="Đăng ký tư vấn việc làm Nhật Bản"
          >
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </button>
        </div>

        {/* Zalo Button */}
        <div className="relative group flex items-center">
          <span className="hidden group-hover:inline-flex md:inline-flex items-center mr-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md transition-all whitespace-nowrap">
            Chat Zalo
          </span>
          <a
            href="https://zalo.me/0987654321"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform"
            aria-label="Chat qua Zalo"
          >
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </a>
        </div>

        {/* Direct Call Button */}
        <div className="relative group flex items-center">
          <span className="hidden group-hover:inline-flex md:inline-flex items-center mr-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md transition-all whitespace-nowrap">
            Gọi ngay 0987.654.321
          </span>
          <a
            href="tel:0987654321"
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-transform relative"
            aria-label="Gọi hotline trực tiếp"
          >
            <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping -z-10" />
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          </a>
        </div>
      </div>

      {/* Quick Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Đăng Ký Thành Công!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã quan tâm. Chuyên viên tư vấn của <strong>Global Career Gate</strong> sẽ liên hệ với bạn trong thời gian sớm nhất.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Hoàn Tất
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-1 pr-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    Tư vấn miễn phí 100%
                  </span>
                  <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                    Đăng Ký Nhận Tư Vấn Việc Làm Nhật Bản
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Điền thông tin bên dưới, chuyên viên tuyển dụng sẽ hỗ trợ tư vấn đơn hàng và lộ trình phù hợp với bạn.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Số điện thoại / Zalo <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0987654321"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Email (nếu có)
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Ngành nghề hoặc vị trí quan tâm
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Kỹ sư IT, Kỹ sư cơ khí, Tokutei Nhà hàng, hoặc mức lương mong muốn..."
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white py-2.5 text-sm font-semibold shadow-md shadow-red-600/25 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Gửi Đăng Ký Tư Vấn</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
