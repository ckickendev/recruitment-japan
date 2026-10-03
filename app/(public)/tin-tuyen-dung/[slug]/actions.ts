'use server'

import { createClient } from '@/lib/supabase/server'

export type ApplicationState = {
  success?: boolean
  error?: string | null
}

export async function submitJobApplication(
  prevState: ApplicationState | null,
  formData: FormData
): Promise<ApplicationState> {
  const full_name = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const note = (formData.get('note') as string)?.trim() || null
  const job_id = (formData.get('job_id') as string)?.trim() || null

  if (!full_name || !phone) {
    return { error: 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại liên hệ.' }
  }

  try {
    const supabase = await createClient()

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
      return { error: `Đã có lỗi xảy ra: ${error.message}` }
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi gửi thông tin'
    return { error: msg }
  }
}
