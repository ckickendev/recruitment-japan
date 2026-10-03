import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with Tailwind CSS class collision resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Vietnamese and international text into clean, SEO-friendly URL slugs.
 * Example: "Kỹ sư Nhật Bản" -> "ky-su-nhat-ban"
 */
export function slugify(text: string): string {
  if (!text) return ''

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace Vietnamese specific accented characters
    .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
    .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
    .replace(/[íìỉĩị]/g, 'i')
    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
    .replace(/[úùủũụưứừửữự]/g, 'u')
    .replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    // Remove diacritical marks from any remaining combined characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove non-alphanumeric characters (excluding spaces and hyphens)
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace whitespace and underscores with a single hyphen
    .replace(/[\s_]+/g, '-')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Formats ISO date string into Vietnamese display format (DD/MM/YYYY).
 * Example: "2026-10-03T16:24:42Z" -> "03/10/2026"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Allowed MIME types for image uploads.
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const MAX_IMAGE_SIZE_MB = 5
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

/**
 * Validates image type (JPG, PNG, WebP) and file size (<= 5MB).
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = MAX_IMAGE_SIZE_MB
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Vui lòng chọn một tệp hình ảnh.' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      isValid: false,
      error: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn tệp JPG, PNG hoặc WebP.',
    }
  }

  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `Dung lượng ảnh (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá mức cho phép tối đa ${maxSizeMB}MB.`,
    }
  }

  return { isValid: true }
}

/**
 * Optional client-side image compressor using HTML Canvas.
 * Automatically resizes large images and converts to modern WebP format.
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options

  if (typeof window === 'undefined') {
    return file
  }

  return new Promise((resolve) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = image

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(image, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '') + '.webp',
            {
              type: 'image/webp',
              lastModified: Date.now(),
            }
          )
          resolve(compressedFile)
        },
        'image/webp',
        quality
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    image.src = objectUrl
  })
}
