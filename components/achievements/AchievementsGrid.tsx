// Ruta: components/achievements/AchievementsGrid.tsx

"use client"

import { useState } from "react"
import { Trophy, Lock, TrendingUp, Zap, Compass, Calendar, Star } from "lucide-react"
import { Achievement, getRarityColor, getRarityBg, GridAchievement } from "@/lib/achievements"
import { AchievementCard } from "./AchievementCard"
import { AchievementModal } from "./AchievementModal"

type AchievementWithProgress = Achievement & {
  progress: number
  current?: number
}

type AchievementWithDate = Achievement & {
  unlocked_at: string
  is_new?: boolean
}

type AchievementsGridProps = {
  unlocked: AchievementWithDate[]
  inProgress: AchievementWithProgress[]
  locked: Achievement[]
  stats: {
    total: number
    unlocked: number
    percentage: number
  }
}

const CATEGORY_ICONS = {
  reading: Trophy,
  speed: Zap,
  diversity: Compass,
  consistency: Calendar,
  quality: Star,
}

const CATEGORY_NAMES = {
  reading: 'Lectura',
  speed: 'Velocidad',
  diversity: 'Diversidad',
  consistency: 'Consistencia',
  quality: 'Calidad',
}

export function AchievementsGrid({ unlocked, inProgress, locked, stats }: AchievementsGridProps) {
const [selectedAchievement, setSelectedAchievement] =
  useState<GridAchievement | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'inProgress' | 'locked'>('all')
  const [categoryFilter, setCategoryFilter] = useState<Achievement['category'] | 'all'>('all')

  // Combinar todos los achievements
  const allAchievements = [
    ...unlocked.map(a => ({ ...a, status: 'unlocked' as const, progress: 100 })),
    ...inProgress.map(a => ({ ...a, status: 'inProgress' as const })),
    ...locked.map(a => ({ ...a, status: 'locked' as const, progress: 0 })),
  ]

  // Filtrar por estado
  let filteredAchievements = allAchievements
  if (filter !== 'all') {
    filteredAchievements = filteredAchievements.filter(a => a.status === filter)
  }

  // Filtrar por categoría
  if (categoryFilter !== 'all') {
    filteredAchievements = filteredAchievements.filter(a => a.category === categoryFilter)
  }

  // Ordenar: desbloqueados primero, luego por progreso, luego bloqueados
  filteredAchievements.sort((a, b) => {
    if (a.status === 'unlocked' && b.status !== 'unlocked') return -1
    if (a.status !== 'unlocked' && b.status === 'unlocked') return 1
    if (a.status === 'inProgress' && b.status === 'locked') return -1
    if (a.status === 'locked' && b.status === 'inProgress') return 1
    return b.progress - a.progress
  })

  const categories = Array.from(new Set(allAchievements.map(a => a.category)))

  return (
    <div className="space-y-8">
      {/* Header con stats */}
      <div className="card bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-heading-2 font-serif text-ink-900">
              Tus Logros
            </h2>
            <p className="text-ink-600">
              Desafíos completados y en progreso
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200">
            <p className="text-3xl font-bold text-amber-600 mb-1">
              {stats.unlocked}
            </p>
            <p className="text-sm text-ink-600">Desbloqueados</p>
          </div>
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {inProgress.length}
            </p>
            <p className="text-sm text-ink-600">En Progreso</p>
          </div>
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-ink-200">
            <p className="text-3xl font-bold text-ink-400 mb-1">
              {locked.length}
            </p>
            <p className="text-sm text-ink-600">Bloqueados</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-700">
              Progreso Total
            </p>
            <p className="text-sm font-bold text-amber-600">
              {stats.percentage}%
            </p>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden border border-amber-200">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-ink-500 mt-2 text-center">
            {stats.unlocked} de {stats.total} logros desbloqueados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        {/* Filtro por estado */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-ink-600 flex-shrink-0">Estado:</span>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos', count: allAchievements.length },
              { id: 'unlocked', label: 'Desbloqueados', count: unlocked.length },
              { id: 'inProgress', label: 'En Progreso', count: inProgress.length },
              { id: 'locked', label: 'Bloqueados', count: locked.length },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as 'all' | 'unlocked' | 'inProgress' | 'locked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-ink-900 text-white shadow-md'
                    : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                }`}
              >
                {f.label}
                <span className={`ml-2 text-xs ${
                  filter === f.id ? 'text-white/80' : 'text-ink-500'
                }`}>
                  ({f.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por categoría */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-ink-600 flex-shrink-0">Categoría:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-ink-900 text-white shadow-md'
                  : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => {
              const Icon = CATEGORY_ICONS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    categoryFilter === cat
                      ? 'bg-ink-900 text-white shadow-md'
                      : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {CATEGORY_NAMES[cat]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid de achievements */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={achievement.status === 'unlocked'}
              isInProgress={achievement.status === 'inProgress'}
              progress={achievement.progress}
              onClick={() => setSelectedAchievement(achievement)}
              animationDelay={index * 50}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-ink-400" />
          </div>
          <p className="text-ink-600">
            No hay logros en esta categoría
          </p>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          isUnlocked={'unlocked_at' in selectedAchievement}
          progress={selectedAchievement.progress || 0}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}