'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { slugify } from '@/lib/utils'
import type { JobStatus, JobUpdate } from '@/types/database'

export type JobActionState = {
  success?: boolean
  error?: string | null
  jobId?: string
}

/**
 * Creates a new Job post and attaches the current user's id as author_id.
 * Permitted for: 'admin' and 'editor'.
 */
export async function createJob(
  prevState: JobActionState | null,
  formData: FormData
): Promise<JobActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    return { error: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên và Biên tập viên mới được tạo tin.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const slug = slugify(customSlug || title)
  const salary = (formData.get('salary') as string)?.trim() || null
  const location = (formData.get('location') as string)?.trim() || null
  const working_hours = (formData.get('working_hours') as string)?.trim() || null
  const requirements = (formData.get('requirements') as string)?.trim() || null
  const benefits = (formData.get('benefits') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim() || null
  const contact_info = (formData.get('contact_info') as string)?.trim() || null
  const category_id = (formData.get('category_id') as string)?.trim() || null
  const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || null
  const status = ((formData.get('status') as JobStatus) || 'published')
  const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true'

  if (!title) {
    return { error: 'Vui lòng nhập tiêu đề việc làm.' }
  }

  try {
    const supabase = await createClient()

    const { data: newJob, error: insertError } = await supabase
      .from('jobs')
      .insert({
        title,
        slug,
        salary,
        location,
        working_hours,
        requirements,
        benefits,
        content,
        contact_info,
        category_id,
        thumbnail_url,
        status,
        is_featured,
        author_id: authContext.userId, // Automatically attach current user as author
        views_count: 0,
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.message.includes('unique constraint') || insertError.message.includes('slug')) {
        return { error: 'Đường dẫn (Slug) này đã tồn tại. Vui lòng đổi tiêu đề hoặc đường dẫn khác.' }
      }
      return { error: `Lỗi lưu tin tuyển dụng: ${insertError.message}` }
    }

    revalidatePath('/admin/dashboard/jobs')
    revalidatePath('/tin-tuyen-dung')
    revalidatePath('/')

    return { success: true, error: null, jobId: newJob?.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo việc làm'
    return { error: msg }
  }
}

/**
 * Updates an existing Job post with permission enforcement.
 * Admins can update any job; Editors can update jobs.
 */
export async function updateJob(
  jobId: string,
  prevState: JobActionState | null,
  formData: FormData
): Promise<JobActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    return { error: 'Quyền truy cập bị từ chối.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const slug = customSlug ? slugify(customSlug) : undefined
  const salary = (formData.get('salary') as string)?.trim() || null
  const location = (formData.get('location') as string)?.trim() || null
  const working_hours = (formData.get('working_hours') as string)?.trim() || null
  const requirements = (formData.get('requirements') as string)?.trim() || null
  const benefits = (formData.get('benefits') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim() || null
  const contact_info = (formData.get('contact_info') as string)?.trim() || null
  const category_id = (formData.get('category_id') as string)?.trim() || null
  const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || null
  const status = (formData.get('status') as JobStatus)
  const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true'

  if (!title) {
    return { error: 'Vui lòng nhập tiêu đề việc làm.' }
  }

  try {
    const supabase = await createClient()

    const updatePayload: JobUpdate = {
      title,
      salary,
      location,
      working_hours,
      requirements,
      benefits,
      content,
      contact_info,
      category_id,
      thumbnail_url,
      is_featured,
      updated_at: new Date().toISOString(),
    }

    if (slug) {
      updatePayload.slug = slug
    }
    if (status) {
      updatePayload.status = status
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', jobId)

    if (updateError) {
      return { error: `Cập nhật tin thất bại: ${updateError.message}` }
    }

    revalidatePath('/admin/dashboard/jobs')
    revalidatePath('/tin-tuyen-dung')
    revalidatePath('/')

    return { success: true, error: null, jobId }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi cập nhật tin'
    return { error: msg }
  }
}

/**
 * Deletes a Job post with RBAC enforcement:
 * - 'admin' can delete any job.
 * - 'editor' can ONLY delete jobs they personally created (author_id = userId).
 * - 'user' cannot delete jobs.
 */
export async function deleteJob(jobId: string): Promise<JobActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    return { error: 'Vui lòng đăng nhập lại.' }
  }

  const supabase = await createClient()

  // Fetch the job to check author_id
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('id, author_id, title')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return { error: 'Không tìm thấy tin việc làm cần xóa.' }
  }

  // Permission check: Admin can delete anything; Editor only their own jobs
  if (!authContext.isAdmin) {
    if (!authContext.isEditor || job.author_id !== authContext.userId) {
      return {
        error: 'Quyền truy cập bị từ chối. Biên tập viên chỉ có quyền xóa các tin do chính mình tạo.',
      }
    }
  }

  try {
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      return { error: `Xóa tin việc làm thất bại: ${deleteError.message}` }
    }

    revalidatePath('/admin/dashboard/jobs')
    revalidatePath('/tin-tuyen-dung')
    revalidatePath('/')

    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa việc làm'
    return { error: msg }
  }
}

/**
 * Toggles a job's status between 'published' and 'draft'.
 */
export async function toggleJobStatus(jobId: string, currentStatus: JobStatus): Promise<JobActionState> {
  const authContext = await getCurrentProfile()

  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    return { error: 'Quyền truy cập bị từ chối.' }
  }

  const nextStatus: JobStatus = currentStatus === 'published' ? 'draft' : 'published'

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('jobs')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId)

    if (error) {
      return { error: `Đổi trạng thái thất bại: ${error.message}` }
    }

    revalidatePath('/admin/dashboard/jobs')
    revalidatePath('/tin-tuyen-dung')
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi đổi trạng thái'
    return { error: msg }
  }
}
