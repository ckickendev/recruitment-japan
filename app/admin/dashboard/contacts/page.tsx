import Link from 'next/link'
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  FileText,
} from 'lucide-react'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { ContactStatusSelector } from '@/components/admin/ContactStatusSelector'
import { formatDate } from '@/lib/utils'
import type { ContactWithRelations } from '@/types/database'

export default async function AdminContactsPage() {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    return null
  }

  const supabase = await createClient()

  // Fetch contacts with linked job
  const { data: contactsData, error } = await supabase
    .from('contacts')
    .select(
      `
      *,
      job:jobs (
        id,
        title,
        slug
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
  }

  const contacts = (contactsData as unknown as ContactWithRelations[]) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Yêu Cầu Tư Vấn &amp; Ứng Tuyển
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Tổng cộng <strong>{contacts.length}</strong> ứng viên gửi thông tin liên hệ
          </p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Ứng viên</th>
                <th className="px-5 py-3.5">Số điện thoại / Zalo</th>
                <th className="px-5 py-3.5">Vị trí quan tâm</th>
                <th className="px-5 py-3.5">Ghi chú &amp; Câu hỏi</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Ngày gửi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Candidate */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{c.full_name}</div>
                        {c.email && (
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Mail className="h-3 w-3 text-slate-500" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Phone / Call */}
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{c.phone}</span>
                      </a>
                    </td>

                    {/* Applied Job */}
                    <td className="px-5 py-4 max-w-xs">
                      {c.job ? (
                        <Link
                          href={`/tin-tuyen-dung/${c.job.slug}`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                        >
                          <Briefcase className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span className="font-medium line-clamp-1">{c.job.title}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Tư vấn chung</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-4 max-w-sm">
                      {c.note ? (
                        <div className="flex items-start gap-1.5 text-slate-300 text-xs line-clamp-2">
                          <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{c.note}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>

                    {/* Status Selector */}
                    <td className="px-5 py-4">
                      <ContactStatusSelector
                        contactId={c.id}
                        currentStatus={c.status}
                      />
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-right text-xs text-slate-400">
                      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(c.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chưa có yêu cầu tư vấn nào từ website.
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
