import { getCurrentProfile } from "@/lib/supabase/roles"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { ContactWidget } from "@/components/shared/ContactWidget"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authUser = await getCurrentProfile()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header authUser={authUser} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactWidget />
    </div>
  )
}
