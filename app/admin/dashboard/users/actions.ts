'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/supabase/roles'
import type { UserRole } from '@/types/database'

export type UserActionState = {
  success?: boolean
  error?: string | null
}

/**
 * Creates a new user in Supabase Auth and public.profiles.
 * Strictly restricted to users with the 'admin' role.
 */
export async function createUser(
  prevState: UserActionState | null,
  formData: FormData
): Promise<UserActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || !authContext.isAdmin) {
    return { error: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên (Admin) mới có quyền tạo thành viên.' }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const full_name = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const role = (formData.get('role') as UserRole) || 'user'

  if (!email || !password || !full_name) {
    return { error: 'Vui lòng cung cấp đầy đủ Email, Mật khẩu và Họ tên.' }
  }

  if (password.length < 6) {
    return { error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' }
  }

  if (!['admin', 'editor', 'user'].includes(role)) {
    return { error: 'Vai trò người dùng không hợp lệ.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // 1. Create user via Supabase Auth Admin API (automatically confirmed)
    const { data: userData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
        role,
      },
    })

    if (authError || !userData.user) {
      return { error: `Lỗi tạo tài khoản: ${authError?.message || 'Không thể tạo người dùng'}` }
    }

    const userId = userData.user.id

    // 2. Upsert profile in public.profiles table
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name,
        phone,
        role,
      })

    if (profileError) {
      console.error('Error creating profile row:', profileError)
      return { error: `Tài khoản đã tạo nhưng lỗi cập nhật hồ sơ: ${profileError.message}` }
    }

    revalidatePath('/admin/dashboard/users')
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo người dùng'
    return { error: msg }
  }
}

/**
 * Updates a user's role in public.profiles and auth metadata.
 * Only executable by an Admin.
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<UserActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || !authContext.isAdmin) {
    return { error: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên mới được phân quyền.' }
  }

  // Prevent admin from demoting themselves
  if (authContext.userId === userId && newRole !== 'admin') {
    return { error: 'Bạn không thể tự hạ quyền Admin của chính mình.' }
  }

  if (!['admin', 'editor', 'user'].includes(newRole)) {
    return { error: 'Vai trò người dùng không hợp lệ.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // Update in profiles table
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (profileError) {
      return { error: `Cập nhật vai trò thất bại: ${profileError.message}` }
    }

    // Sync role into auth metadata
    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    })

    revalidatePath('/admin/dashboard/users')
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi cập nhật vai trò'
    return { error: msg }
  }
}

/**
 * Deletes a user account from Supabase Auth and cascade deletes their profile.
 * Only executable by an Admin.
 */
export async function deleteUser(userId: string): Promise<UserActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || !authContext.isAdmin) {
    return { error: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên mới có thể xóa tài khoản.' }
  }

  // Prevent admin from deleting their own account
  if (authContext.userId === userId) {
    return { error: 'Bạn không thể xóa tài khoản của chính mình khi đang đăng nhập.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // Delete user from auth (profiles table will cascade delete)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return { error: `Xóa tài khoản thất bại: ${deleteError.message}` }
    }

    revalidatePath('/admin/dashboard/users')
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi xóa tài khoản'
    return { error: msg }
  }
}
