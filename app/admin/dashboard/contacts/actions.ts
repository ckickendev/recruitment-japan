'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/supabase/roles'
import type { ContactStatus } from '@/types/database'

export async function updateContactStatus(contactId: string, status: ContactStatus) {
  const authContext = await getCurrentProfile()
  if (!authContext) {
    return { error: 'Vui lòng đăng nhập lại.' }
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId)

    if (error) {
      if (error.message.includes('contacts_status_check')) {
        return {
          error: `Trạng thái "${status}" chưa được khai báo trong Database Supabase. Vui lòng chạy lệnh SQL cập nhật contacts_status_check.`,
        }
      }
      return { error: `Cập nhật trạng thái thất bại: ${error.message}` }
    }

    revalidatePath('/admin/dashboard/contacts')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái'
    return { error: msg }
  }
}
