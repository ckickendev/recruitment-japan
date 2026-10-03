'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Signs out the currently authenticated user from Supabase Auth.
 * Revalidates the root layout cache and redirects to the specified route.
 *
 * @param redirectTo Optional destination URL (defaults to '/admin/login')
 */
export async function logoutAction(redirectTo: string = '/admin/login') {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }

  // Revalidate cache across all layouts and routes
  revalidatePath('/', 'layout')

  // Next.js redirect must be called outside try/catch
  redirect(redirectTo)
}
