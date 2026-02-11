// Ruta: components/challenges/ChallengeDetailsModal.tsx

"use client"

import { X, Trash2, Flag } from "lucide-react"
import { useState } from "react"
import { deleteChallenge, updateChallengeStatus } from "@/app/actions/challenges"
import { toast } from "sonner"
import type { Challenge } from "@/lib/challenges"
import { getChallengePercentage, getDaysRemaining } from "@/lib/challenges"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function ChallengeDetailsModal({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [showDelete, setShowDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const percentage = getChallengePercentage(challenge)
  const daysLeft = getDaysRemaining(challenge)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteChallenge(challenge.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Desafío eliminado')
      onClose()
    }
    setLoading(false)
  }

  async function handleAbandon() {
    setLoading(true)
    const result = await updateChallengeStatus(challenge.id, 'abandoned')
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Desafío abandonado')
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full hover:bg-cream-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-ink-600" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="text-6xl">{challenge.icon}</div>
            <div className="flex-1">
              <h2 className="text-heading-2 font-serif text-ink-900 mb-2">{challenge.title}</h2>
              {challenge.description && <p className="text-ink-600">{challenge.description}</p>}
            </div>
          </div>

          {/* Progreso */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-ink-700 font-medium">Progreso</span>
              <span className="text-2xl font-bold text-ink-900">{percentage}%</span>
            </div>
            <div className="h-4 bg-ink-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all bg-gradient-to-r ${challenge.color}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-ink-600">
              {challenge.current_value} de {challenge.target_value}
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-cream-50 rounded-lg">
              <p className="text-sm text-ink-600 mb-1">Inicio</p>
              <p className="font-medium">{format(new Date(challenge.start_date), "d MMM yyyy", { locale: es })}</p>
            </div>
            <div className="p-4 bg-cream-50 rounded-lg">
              <p className="text-sm text-ink-600 mb-1">Finalización</p>
              <p className="font-medium">{format(new Date(challenge.end_date), "d MMM yyyy", { locale: es })}</p>
            </div>
          </div>

          {challenge.status === 'active' && (
            <div className="p-4 bg-blue-50 rounded-lg mb-6 border border-blue-200">
              <p className="text-center text-blue-700 font-medium">
                {daysLeft === 0 ? '¡Último día!' : daysLeft === 1 ? '¡1 día restante!' : `${daysLeft} días restantes`}
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-ink-100">
            {challenge.status === 'active' && (
              <button onClick={handleAbandon} disabled={loading} className="btn-ghost text-amber-600">
                <Flag className="w-4 h-4 mr-2" />
                Abandonar
              </button>
            )}

            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="btn-ghost text-red-600 ml-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            ) : (
              <div className="flex gap-2 ml-auto">
                <button onClick={handleDelete} disabled={loading} className="btn-ghost text-red-600">
                  Confirmar
                </button>
                <button onClick={() => setShowDelete(false)} className="btn-ghost">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}