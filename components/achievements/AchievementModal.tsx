// Ruta: components/achievements/AchievementModal.tsx

"use client"

import { X, Trophy, Calendar, Target } from "lucide-react"
import { Achievement, getRarityBg, getRarityColor } from "@/lib/achievements"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type AchievementModalProps = {
  achievement: Achievement & { 
    unlocked_at?: string
    progress?: number
    current?: number
  }
  isUnlocked: boolean
  progress: number
  onClose: () => void
}

const CATEGORY_NAMES = {
  reading: 'Lectura',
  speed: 'Velocidad',
  diversity: 'Diversidad',
  consistency: 'Consistencia',
  quality: 'Calidad',
}

export function AchievementModal({
  achievement,
  isUnlocked,
  progress,
  onClose,
}: AchievementModalProps) {
  const isLocked = !isUnlocked && progress === 0
  const isInProgress = !isUnlocked && progress > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative bg-white rounded-2xl shadow-elevated max-w-lg w-full 
        overflow-hidden animate-scale-in border-4
        ${isUnlocked ? getRarityBg(achievement.rarity).replace('bg-', 'border-').replace('-100', '-300') : 'border-ink-200'}
      `}>
        {/* Header con gradiente */}
        <div className={`
          relative px-8 py-12 text-center
          ${isUnlocked 
            ? `bg-gradient-to-br ${achievement.color}`
            : isInProgress
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-ink-400 to-ink-600'
          }
        `}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Icono grande */}
          <div className="text-8xl mb-4 animate-bounce-subtle">
            {achievement.icon}
          </div>

          {/* Nombre */}
          <h2 className="text-heading-2 font-serif text-white mb-2">
            {achievement.name}
          </h2>

          {/* Rarity */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {achievement.rarity === 'common' && 'Común'}
              {achievement.rarity === 'rare' && 'Raro'}
              {achievement.rarity === 'epic' && 'Épico'}
              {achievement.rarity === 'legendary' && 'Legendario'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Descripción */}
          <div>
            <p className="text-body text-ink-700 text-center leading-relaxed">
              {achievement.description}
            </p>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-cream-50 rounded-lg text-center">
              <p className="text-xs text-ink-600 mb-1">Categoría</p>
              <p className="font-semibold text-ink-900">
                {CATEGORY_NAMES[achievement.category]}
              </p>
            </div>
            <div className="p-4 bg-cream-50 rounded-lg text-center">
              <p className="text-xs text-ink-600 mb-1">Requisito</p>
              <p className="font-semibold text-ink-900">
                {achievement.requirement}
              </p>
            </div>
          </div>

          {/* Estado */}
          {isUnlocked && achievement.unlocked_at && (
            <div className={`
              p-4 rounded-lg border-2 text-center
              ${getRarityBg(achievement.rarity)}
            `}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <p className="font-semibold text-emerald-700">
                  ¡Desbloqueado!
                </p>
              </div>
              <p className="text-sm text-ink-600">
                {format(new Date(achievement.unlocked_at), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          )}

          {isInProgress && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-blue-700">
                  En Progreso
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">
                    {achievement.current || 0} / {achievement.requirement}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {progress}%
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-blue-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-ink-600 mt-2">
                  {achievement.requirement - (achievement.current || 0)} más para desbloquear
                </p>
              </div>
            </div>
          )}

          {isLocked && (
            <div className="p-4 bg-ink-50 rounded-lg border-2 border-ink-200 text-center">
              <p className="text-sm text-ink-600">
                🔒 Bloqueado
              </p>
              <p className="text-xs text-ink-500 mt-2">
                Continúa leyendo para desbloquear este logro
              </p>
            </div>
          )}

          {/* Call to action */}
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}