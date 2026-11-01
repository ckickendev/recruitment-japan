'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export type SubmitConsultationState = {
  success?: boolean
  error?: string | null
}

export interface ConsultationInput {
  full_name: string
  phone: string
  email?: string | null
  note?: string | null
  job_id?: string | null
}

/**
 * Server Action to submit a consultation request or candidate application.
 * Uses createAdminClient to ensure public anonymous submissions succeed
 * and immediately appear in the Admin Dashboard.
 */
export async function submitConsultationRequest(
  data: ConsultationInput
): Promise<SubmitConsultationState> {
  const full_name = data.full_name?.trim()
  const phone = data.phone?.trim()
  const email = data.email?.trim() || null
  const note = data.note?.trim() || null
  const job_id = data.job_id?.trim() || null

  if (!full_name || !phone) {
    return { error: 'Vui lòng cung cấp đầy đủ Họ và tên và Số điện thoại liên hệ.' }
  }

  // Basic phone format validation (at least 9 digits)
  const phoneClean = phone.replace(/[^0-9+]/g, '')
  if (phoneClean.length < 9) {
    return { error: 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.' }
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('contacts').insert([
      {
        full_name,
        phone,
        email,
        note,
        job_id,
        status: 'pending',
      },
    ])

    if (error) {
      console.error('Lỗi khi lưu yêu cầu tư vấn:', error)
      return { error: `Không thể gửi thông tin: ${error.message}` }
    }

    revalidatePath('/admin/dashboard/contacts')
    return { success: true, error: null }
  } catch (err: unknown) {
    console.error('Lỗi hệ thống khi gửi yêu cầu tư vấn:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống. Vui lòng liên hệ hotline.'
    return { error: msg }
  }
}
