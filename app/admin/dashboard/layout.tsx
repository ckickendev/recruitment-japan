import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/roles'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authContext = await getCurrentProfile()

  if (!authContext) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar
        profile={authContext.profile}
        email={authContext.email}
        isAdmin={authContext.isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
