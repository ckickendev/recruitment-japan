'use client'

import { useTransition, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateContactStatus } from '@/app/admin/dashboard/contacts/actions'
import type { ContactStatus } from '@/types/database'

interface ContactStatusSelectorProps {
  contactId: string
  currentStatus: ContactStatus
}

export function ContactStatusSelector({
  contactId,
  currentStatus,
}: ContactStatusSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<ContactStatus>(currentStatus)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ContactStatus
    setStatus(newStatus)

    startTransition(async () => {
      const res = await updateContactStatus(contactId, newStatus)
      if (res?.error) {
        alert(res.error)
        setStatus(currentStatus)
      }
    })
  }

  const getStatusColor = (val: string) => {
    switch (val) {
      case 'contacted':
        return 'text-blue-400 border-blue-500/30 bg-blue-950/20'
      case 'reviewed':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
      case 'rejected':
        return 'text-red-400 border-red-500/30 bg-red-950/20'
      default:
        return 'text-amber-400 border-amber-500/30 bg-amber-950/20'
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`h-7 rounded-lg border text-xs font-semibold px-2 py-0.5 focus:outline-none cursor-pointer ${getStatusColor(
          status
        )}`}
      >
        <option value="pending" className="bg-slate-900 text-amber-400">Chờ xử lý</option>
        <option value="contacted" className="bg-slate-900 text-blue-400">Đã liên hệ</option>
        <option value="reviewed" className="bg-slate-900 text-emerald-400">Hoàn tất / Đã duyệt</option>
        <option value="rejected" className="bg-slate-900 text-red-400">Từ chối / Hủy</option>
      </select>
    </div>
  )
}
