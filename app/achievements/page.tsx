// Ruta: app/achievements/page.tsx

import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getUserAchievements } from "@/app/actions/achievements"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { AchievementsGrid } from "@/components/achievements/AchievementsGrid"
import type { User } from "@/lib/types"

export default async function AchievementsPage() {
  const user = await getUser() as User | null
  
  if (!user) {
    redirect('/login')
  }

  const achievementsData = await getUserAchievements()

  if (!achievementsData) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="container-elegant py-12 space-y-12">
        {/* Welcome Section */}
        <section className="animate-in">
          <h1 className="text-heading-1 font-serif text-ink-900 mb-3">
            Logros y Desafíos
          </h1>
          <p className="text-body-lg text-ink-600">
            Completa desafíos y desbloquea logros mientras lees
          </p>
        </section>

        {/* Achievements Grid */}
        <AchievementsGrid
          unlocked={achievementsData.unlocked}
          inProgress={achievementsData.inProgress}
          locked={achievementsData.locked}
          stats={achievementsData.stats}
        />
      </main>
    </div>
  )
}