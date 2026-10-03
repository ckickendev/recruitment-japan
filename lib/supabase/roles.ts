import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types/database'

export interface UserAuthContext {
  userId: string
  email: string
  profile: Profile
  isAdmin: boolean
  isEditor: boolean
  isUser: boolean
  canManageUsers: boolean
  canManageAllJobs: boolean
  canViewAllContacts: boolean
}

/**
 * Retrieves the currently authenticated user along with their RBAC profile.
 * Returns null if unauthenticated.
 */
export async function getCurrentProfile(): Promise<UserAuthContext | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Default fallback profile if trigger hasn't fired yet
  const userProfile: Profile = profile || {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) || user.email || 'Thành viên',
    phone: (user.user_metadata?.phone as string) || null,
    role: ((user.user_metadata?.role as UserRole) || 'user'),
    created_at: user.created_at,
  }

  const role = userProfile.role
  const isAdmin = role === 'admin'
  const isEditor = role === 'editor'
  const isUser = role === 'user'

  return {
    userId: user.id,
    email: user.email || '',
    profile: userProfile,
    isAdmin,
    isEditor,
    isUser,
    canManageUsers: isAdmin,
    canManageAllJobs: isAdmin,
    canViewAllContacts: isAdmin,
  }
}

/**
 * Asserts that the current user has the `admin` role.
 * Redirects or throws if not authorized.
 */
export async function requireAdmin(): Promise<UserAuthContext> {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    redirect('/admin/login?redirectTo=/admin/dashboard/users')
  }

  if (!authContext.isAdmin) {
    redirect('/admin/dashboard/jobs')
  }

  return authContext
}

/**
 * Asserts that the current user has one of the specified roles.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserAuthContext> {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    redirect('/admin/login')
  }

  if (!allowedRoles.includes(authContext.profile.role)) {
    redirect('/admin/dashboard/jobs')
  }

  return authContext
}
