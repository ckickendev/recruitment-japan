'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginActionState = {
  error: string | null
}

/**
 * Authenticates an admin user using Supabase Auth.
 * Redirects to /admin/dashboard/jobs on success.
 */
export async function loginAdmin(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let message = error.message
    if (error.message.includes('Invalid login credentials')) {
      message = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Email chưa được xác nhận. Vui lòng kiểm tra hòm thư.'
    } else if (error.message.includes('Too many requests')) {
      message = 'Quá nhiều lần thử đăng nhập không thành công. Vui lòng thử lại sau.'
    }

    return { error: message }
  }

  // Next.js redirect must be outside try/catch
  redirect('/admin/dashboard/jobs')
}
