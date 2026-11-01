import { notFound, redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { EditJobForm } from './EditJobForm'
import type { Category, Job } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params
  const authContext = await getCurrentProfile()

  if (!authContext || (!authContext.isAdmin && !authContext.isEditor)) {
    redirect('/admin/dashboard/jobs')
  }

  const supabase = await createClient()

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'job_category')
    .order('name')

  return (
    <EditJobForm
      job={job as Job}
      categories={(categories as Category[]) || []}
    />
  )
}
