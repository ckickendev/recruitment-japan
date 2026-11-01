import { validateImageFile } from '@/lib/utils'
import {
  JOB_IMAGES_BUCKET,
  uploadImageServerAction,
  deleteImageServerAction,
} from '@/app/actions/upload'

export { JOB_IMAGES_BUCKET }

/**
 * Uploads an image file to the `job-images` bucket in Supabase Storage via Server Action.
 *
 * @param file The image File object to upload.
 * @returns The public URL of the uploaded image.
 * @throws Error if validation fails or upload encounters an error.
 */
export async function uploadJobImage(file: File): Promise<string> {
  // 1. Validate file format and size
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Tệp ảnh không hợp lệ.')
  }

  // 2. Prepare FormData and call server action
  const formData = new FormData()
  formData.append('file', file)

  const res = await uploadImageServerAction(formData)
  if (res.error || !res.url) {
    throw new Error(res.error || 'Lỗi khi tải ảnh lên Supabase Storage.')
  }

  return res.url
}

/**
 * Removes an image from the `job-images` bucket in Supabase Storage.
 *
 * @param urlOrPath The full public URL or relative path of the image.
 * @returns Boolean indicating whether deletion succeeded.
 */
export async function deleteJobImage(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return false

  try {
    const res = await deleteImageServerAction(urlOrPath)
    return res.success
  } catch (err) {
    console.error('Lỗi không xác định khi xóa ảnh:', err)
    return false
  }
}

