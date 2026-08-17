import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getPublicUserProfile } from "@/app/actions/social"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { UserProfileClient } from "@/components/users/UserProfileClient"
import type { User } from "@/lib/types"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = (await getUser()) as User | null
  if (!user) redirect("/login")

  const { id } = await params
  const { profile, error } = await getPublicUserProfile(id)

  return (
    <div className="min-h-screen bg-cream-50">
      <DashboardHeader user={user} />
      {profile ? <UserProfileClient profile={profile} /> : <main className="container-elegant py-16"><section className="card text-center"><h1 className="font-serif text-2xl text-ink-900">No se pudo abrir este perfil</h1><p className="mt-2 text-ink-600">{error ?? "El perfil no existe."}</p></section></main>}
    </div>
  )
}
