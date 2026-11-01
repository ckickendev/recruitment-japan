'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { validateImageFile } from '@/lib/utils'

const JOB_IMAGES_BUCKET = 'job-images'

/**
 * Server Action to upload image file securely using Supabase admin client.
 * Bypasses client-side RLS and verifies Admin/Editor role on server.
 */
export async function uploadImageServerAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const authContext = await getCurrentProfile()
  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    return { error: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên và Biên tập viên mới có quyền tải ảnh.' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { error: 'Không tìm thấy tệp ảnh tải lên.' }
  }

  const validation = validateImageFile(file)
  if (!validation.isValid) {
    return { error: validation.error || 'Tệp ảnh không hợp lệ.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // Generate unique file path with random UUID
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `jobs/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage bucket
    const { data, error } = await adminSupabase.storage
      .from(JOB_IMAGES_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return { error: `Lỗi khi tải ảnh lên Supabase Storage: ${error.message}` }
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from(JOB_IMAGES_BUCKET).getPublicUrl(data.path)

    return { url: publicUrl }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải ảnh'
    return { error: msg }
  }
}

/**
 * Server Action to remove an image from the storage bucket.
 */
export async function deleteImageServerAction(
  urlOrPath: string
): Promise<{ success: boolean; error?: string }> {
  const authContext = await getCurrentProfile()
  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    return { success: false, error: 'Quyền truy cập bị từ chối.' }
  }

  if (!urlOrPath) return { success: false }

  try {
    const adminSupabase = createAdminClient()
    let relativePath = urlOrPath

    if (urlOrPath.includes(JOB_IMAGES_BUCKET)) {
      const parts = urlOrPath.split(`${JOB_IMAGES_BUCKET}/`)
      if (parts.length > 1) {
        relativePath = parts[1]
      }
    }

    const { error } = await adminSupabase.storage
      .from(JOB_IMAGES_BUCKET)
      .remove([relativePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi khi xóa ảnh'
    return { success: false, error: msg }
  }
}
