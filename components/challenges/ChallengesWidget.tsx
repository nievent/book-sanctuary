// Ruta: components/challenges/ChallengesWidget.tsx

"use client"

import { Target, ArrowRight, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Challenge } from "@/lib/challenges"
import { getChallengePercentage, getDaysRemaining } from "@/lib/challenges"

export function ChallengesWidget({ challenges }: { challenges: Challenge[] }) {
  const active = challenges.filter(c => c.status === 'active').slice(0, 3)

  return (
    <div className="card bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-heading-3 font-serif text-ink-900">Desafíos</h3>
            <p className="text-sm text-ink-600">{active.length} activos</p>
          </div>
        </div>
        <Link
          href="/challenges"
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg transition-colors text-sm font-medium text-ink-700"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {active.length > 0 ? (
        <div className="space-y-3">
          {active.map(challenge => {
            const percentage = getChallengePercentage(challenge)
            const daysLeft = getDaysRemaining(challenge)
            const isOnTrack = percentage >= 50

            return (
              <div key={challenge.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{challenge.icon}</span>
                    <h4 className="font-medium text-ink-900 text-sm line-clamp-1 flex-1">
                      {challenge.title}
                    </h4>
                  </div>
                  {isOnTrack ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-ink-600">
                    <span>{challenge.current_value} / {challenge.target_value}</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOnTrack
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-500">{daysLeft} días restantes</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-ink-600 mb-4 text-sm">No tienes desafíos activos</p>
          <Link href="/challenges" className="text-sm text-purple-600 hover:text-purple-700 font-medium underline">
            Crear tu primer desafío
          </Link>
        </div>
      )}
    </div>
  )
}