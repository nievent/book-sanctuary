// Ruta: components/challenges/ChallengeCard.tsx

"use client"

import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Challenge } from "@/lib/challenges"
import { getChallengePercentage, getDaysRemaining } from "@/lib/challenges"

type ChallengeCardProps = {
  challenge: Challenge
  onClick: () => void
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const percentage = getChallengePercentage(challenge)
  const daysLeft = getDaysRemaining(challenge)
  const isCompleted = challenge.status === 'completed'
  const isExpired = challenge.status === 'failed'
  const isOnTrack = percentage >= 50 || isCompleted

  return (
    <div
      onClick={onClick}
      className={`
        card cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-elevated
        ${isCompleted ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300' : ''}
        ${isExpired ? 'opacity-70' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">{challenge.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-ink-900 text-lg line-clamp-2 mb-1">
            {challenge.title}
          </h3>
          {challenge.description && (
            <p className="text-sm text-ink-600 line-clamp-2">
              {challenge.description}
            </p>
          )}
        </div>
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium border-2 flex-shrink-0
          ${isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
            isExpired ? 'bg-red-100 text-red-700 border-red-300' :
            'bg-blue-100 text-blue-700 border-blue-300'}
        `}>
          {isCompleted ? 'Completado' : isExpired ? 'Expirado' : 'Activo'}
        </span>
      </div>

      {/* Progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-ink-900">
              {challenge.current_value}
            </span>
            <span className="text-ink-500">/ {challenge.target_value}</span>
          </div>
          <span className={`text-lg font-bold ${percentage >= 100 ? 'text-emerald-600' : 'text-ink-600'}`}>
            {percentage}%
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${challenge.color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        {challenge.status === 'active' && (
          <>
            <div className="flex items-center gap-2 text-ink-600">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft} {daysLeft === 1 ? 'día' : 'días'} restantes</span>
            </div>
            {isOnTrack ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">En buen ritmo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Necesita esfuerzo</span>
              </div>
            )}
          </>
        )}

        {isCompleted && challenge.completed_at && (
          <div className="flex items-center gap-2 text-emerald-600 w-full justify-center">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {format(new Date(challenge.completed_at), "d 'de' MMM yyyy", { locale: es })}
            </span>
          </div>
        )}
      </div>

      {/* Filtros específicos */}
      {(challenge.genre_filter || challenge.author_filter) && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap gap-2">
          {challenge.genre_filter && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              Género: {challenge.genre_filter}
            </span>
          )}
          {challenge.author_filter && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              Autor: {challenge.author_filter}
            </span>
          )}
        </div>
      )}
    </div>
  )
}