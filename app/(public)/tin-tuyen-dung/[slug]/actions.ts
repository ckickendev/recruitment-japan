'use server'

import { submitConsultationRequest, type SubmitConsultationState } from '@/app/actions/contact'

export type ApplicationState = SubmitConsultationState

export async function submitJobApplication(
  prevState: ApplicationState | null,
  formData: FormData
): Promise<ApplicationState> {
  const full_name = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const note = (formData.get('note') as string)?.trim() || null
  const job_id = (formData.get('job_id') as string)?.trim() || null

  return await submitConsultationRequest({
    full_name,
    phone,
    email,
    note,
    job_id,
  })
}
