import { createClient } from '@/lib/supabase/client'
import { validateImageFile } from '@/lib/utils'

export const JOB_IMAGES_BUCKET = 'job-images'

/**
 * Uploads an image file to the `job-images` bucket in Supabase Storage.
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

  const supabase = createClient()

  // 2. Generate unique file path with random UUID
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `jobs/${fileName}`

  // 3. Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(JOB_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Lỗi khi tải ảnh lên Supabase Storage: ${error.message}`)
  }

  // 4. Retrieve and return the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(JOB_IMAGES_BUCKET).getPublicUrl(data.path)

  return publicUrl
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
    const supabase = createClient()
    let relativePath = urlOrPath

    if (urlOrPath.includes(JOB_IMAGES_BUCKET)) {
      const parts = urlOrPath.split(`${JOB_IMAGES_BUCKET}/`)
      if (parts.length > 1) {
        relativePath = parts[1]
      }
    }

    const { error } = await supabase.storage
      .from(JOB_IMAGES_BUCKET)
      .remove([relativePath])

    if (error) {
      console.error('Lỗi khi xóa ảnh khỏi Storage:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Lỗi không xác định khi xóa ảnh:', err)
    return false
  }
}
