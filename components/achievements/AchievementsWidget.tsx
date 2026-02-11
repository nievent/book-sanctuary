// Ruta: components/achievements/AchievementsWidget.tsx

"use client"

import { Trophy, ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import { Achievement, getRarityBg } from "@/lib/achievements"

type AchievementWithDate = Achievement & {
  unlocked_at: string
  is_new?: boolean
}

type AchievementWithProgress = Achievement & {
  progress: number
  current?: number
}

type AchievementsWidgetProps = {
  unlocked: AchievementWithDate[]
  inProgress: AchievementWithProgress[]
  stats: {
    total: number
    unlocked: number
    percentage: number
  }
}

export function AchievementsWidget({ unlocked, inProgress, stats }: AchievementsWidgetProps) {
  // Mostrar los 3 achievements más recientes
  const recentUnlocked = unlocked
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 3)

  // Mostrar los 2 achievements más cercanos a completar
  const nearCompletion = inProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2)

  return (
    <div className="card bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-heading-3 font-serif text-ink-900">
              Logros
            </h3>
            <p className="text-sm text-ink-600">
              {stats.unlocked} de {stats.total} desbloqueados
            </p>
          </div>
        </div>
        <Link
          href="/achievements"
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg transition-colors text-sm font-medium text-ink-700"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-600">Progreso Global</span>
          <span className="font-bold text-amber-600">{stats.percentage}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-amber-200">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full transition-all duration-1000"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Recently unlocked */}
      {recentUnlocked.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-ink-700 mb-3">
            ✨ Desbloqueados recientemente
          </h4>
          <div className="space-y-2">
            {recentUnlocked.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 bg-white/80 backdrop-blur-sm
                  hover:scale-102 transition-transform cursor-pointer
                  ${getRarityBg(achievement.rarity)}
                `}
              >
                <div className="text-3xl flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 text-sm truncate">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-ink-600 truncate">
                    {achievement.description}
                  </p>
                </div>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Near completion */}
      {nearCompletion.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink-700 mb-3">
            🎯 Casi completados
          </h4>
          <div className="space-y-2">
            {nearCompletion.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-blue-200 hover:scale-102 transition-transform cursor-pointer"
              >
                <div className="text-2xl flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 text-sm truncate">
                    {achievement.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                      {achievement.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 mt-1">
                    {achievement.current} / {achievement.requirement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentUnlocked.length === 0 && nearCompletion.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-ink-600 mb-2">
            ¡Completa libros para desbloquear logros!
          </p>
          <Link
            href="/achievements"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium underline"
          >
            Ver todos los logros disponibles
          </Link>
        </div>
      )}
    </div>
  )
}