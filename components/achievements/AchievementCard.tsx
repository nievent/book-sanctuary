// Ruta: components/achievements/AchievementCard.tsx

"use client"

import { Lock, Check } from "lucide-react"
import { Achievement, getRarityBg, getRarityColor } from "@/lib/achievements"

type AchievementCardProps = {
  achievement: Achievement & { progress?: number; current?: number }
  isUnlocked: boolean
  isInProgress?: boolean
  progress?: number
  onClick: () => void
  animationDelay?: number
}

export function AchievementCard({
  achievement,
  isUnlocked,
  isInProgress,
  progress = 0,
  onClick,
  animationDelay = 0,
}: AchievementCardProps) {
  const isLocked = !isUnlocked && !isInProgress

  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden border-2 
        transition-all duration-300 hover:scale-105 hover:shadow-elevated
        animate-in
        ${isUnlocked 
          ? getRarityBg(achievement.rarity) + ' hover:brightness-105'
          : isInProgress
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
          : 'bg-ink-50 border-ink-200 opacity-60 hover:opacity-80'
        }
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Badge de estado */}
      {isUnlocked && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {isLocked && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-ink-300 flex items-center justify-center shadow-lg z-10">
          <Lock className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Icono */}
        <div className="flex items-center justify-center">
          <div className={`
            text-5xl 
            ${isLocked ? 'grayscale opacity-40' : ''}
            ${isUnlocked ? 'animate-bounce-subtle' : ''}
            transition-all duration-300
          `}>
            {achievement.icon}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <h3 className={`
            font-serif font-semibold text-center mb-1 line-clamp-2
            ${isUnlocked ? getRarityColor(achievement.rarity) : 'text-ink-900'}
            ${isLocked ? 'text-ink-400' : ''}
          `}>
            {achievement.name}
          </h3>
          
          {/* Rarity badge */}
          <div className="flex items-center justify-center gap-1">
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded-full
              ${isUnlocked 
                ? getRarityBg(achievement.rarity) 
                : 'bg-ink-100 text-ink-500'
              }
            `}>
              {achievement.rarity === 'common' && '⚪ Común'}
              {achievement.rarity === 'rare' && '🔵 Raro'}
              {achievement.rarity === 'epic' && '🟣 Épico'}
              {achievement.rarity === 'legendary' && '🟡 Legendario'}
            </span>
          </div>
        </div>

        {/* Progreso */}
        {isInProgress && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-ink-600">
                {achievement.current || 0} / {achievement.requirement}
              </span>
              <span className="font-semibold text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-blue-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isLocked && (
          <div className="text-center">
            <p className="text-xs text-ink-400">
              Requisito: {achievement.requirement}
            </p>
          </div>
        )}
      </div>

      {/* Efecto de brillo en hover para desbloqueados */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  )
}