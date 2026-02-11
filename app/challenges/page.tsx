// Ruta: app/challenges/page.tsx

import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getChallenges } from "@/app/actions/challenges"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ChallengesGrid } from "@/components/challenges/ChallengesGrid"
import type { User } from "@/lib/types"
import { Target, Trophy, TrendingUp } from "lucide-react"

export default async function ChallengesPage() {
  const user = await getUser() as User | null
  
  if (!user) {
    redirect('/login')
  }

  const challenges = await getChallenges()

  const activeCount = challenges.filter(c => c.status === 'active').length
  const completedCount = challenges.filter(c => c.status === 'completed').length
  const totalProgress = challenges
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.current_value / c.target_value) * 100, 0)
  const avgProgress = activeCount > 0 ? Math.round(totalProgress / activeCount) : 0

  return (
    <div className="min-h-screen bg-cream-50">
      <DashboardHeader user={user} />

      <main className="container-elegant py-12 space-y-12">
        {/* Header */}
        <section className="animate-in">
          <h1 className="text-heading-1 font-serif text-ink-900 mb-3">
            Desafíos de Lectura
          </h1>
          <p className="text-body-lg text-ink-600">
            Establece metas y alcanza tus objetivos literarios
          </p>
        </section>

        {/* Stats */}
        {challenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-900">{activeCount}</p>
                  <p className="text-sm text-ink-600">Desafíos Activos</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-900">{completedCount}</p>
                  <p className="text-sm text-ink-600">Completados</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-900">{avgProgress}%</p>
                  <p className="text-sm text-ink-600">Progreso Promedio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <ChallengesGrid challenges={challenges} />
      </main>
    </div>
  )
}