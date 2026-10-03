import Link from "next/link"
import { Globe, MapPin, Phone, Mail, Clock, ShieldCheck, ChevronRight, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-md">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white">
                  GLOBAL <span className="text-red-500">CAREER GATE</span>
                </span>
                <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                  Cổng Cơ Hội Việc Làm Nhật Bản
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Cầu nối tin cậy kết nối kỹ sư và lao động tay nghề cao Việt Nam với hàng trăm doanh nghiệp, nghiệp đoàn uy tín hàng đầu Nhật Bản.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Giấy phép hoạt động dịch vụ việc làm chuẩn quốc tế</span>
            </div>

            {/* Zalo CTA button in footer */}
            <div className="pt-2">
              <a
                href="https://zalo.me/0987654321"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white px-3.5 py-2 text-xs font-medium transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat Zalo Tư Vấn Nhanh</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Cơ Hội Việc Làm
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Tất cả việc làm Nhật Bản", href: "/jobs" },
                { label: "Việc làm Kỹ sư IT & Công nghệ", href: "/jobs?type=it" },
                { label: "Kỹ sư Cơ khí - Điện tử", href: "/jobs?type=engineering" },
                { label: "Đơn hàng Kỹ năng đặc định (Tokutei)", href: "/jobs?type=tokutei" },
                { label: "Ngành nghề tuyển dụng hot", href: "/categories" },
                { label: "Quy trình & Hồ sơ Visa Nhật", href: "/categories" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-red-500 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Liên Hệ Trực Tiếp
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Trụ sở Hà Nội:</strong> Tầng 6, Tòa nhà Innovation, Cầu Giấy, Hà Nội
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Tokyo Office:</strong> 〒160-0023 Tokyo, Shinjuku City, Nishishinjuku 2-8-1
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-red-500 shrink-0" />
                <div>
                  <a
                    href="tel:0987654321"
                    className="text-slate-200 hover:text-white font-medium"
                  >
                    Hotline: 0987.654.321
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-red-500 shrink-0" />
                <a
                  href="mailto:contact@globalcareergate.com"
                  className="hover:text-white transition-colors"
                >
                  contact@globalcareergate.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-red-500 shrink-0" />
                <span>Thứ 2 - Thứ 7: 08:00 - 18:00</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Consultation Advice */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Hỗ Trợ Ứng Viên
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bạn cần thẩm định hồ sơ, kiểm tra điều kiện visa hay cần tư vấn mức lương thực tế tại Nhật Bản?
            </p>
            <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-300 font-medium">
                Tư vấn viên sẵn sàng giải đáp 1-1 miễn phí mọi thắc mắc
              </div>
              <Link
                href="/contact"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs font-semibold transition-colors"
              >
                Gửi Yêu Cầu Hỗ Trợ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Global Career Gate. Toàn bộ bản quyền được bảo lưu.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Hỗ trợ ứng viên
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
