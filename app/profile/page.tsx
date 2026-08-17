import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm"
import { getProfileVisibility } from "@/lib/profile"
import type { User } from "@/lib/types"

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect("/login")

  return <div className="min-h-screen bg-cream-50"><DashboardHeader user={user as User} /><main className="container-elegant py-12"><section className="mb-8"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900"><Settings className="h-6 w-6 text-cream-50" /></div><h1 className="font-serif text-4xl font-semibold text-ink-900">Mi perfil</h1><p className="mt-2 text-ink-600">Configura cómo te ven otros lectores.</p></section><ProfileSettingsForm initialVisibility={getProfileVisibility(user.user_metadata)} /></main></div>
}
