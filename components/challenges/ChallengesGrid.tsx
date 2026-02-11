// Ruta: components/challenges/ChallengesGrid.tsx

"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { ChallengeCard } from "./ChallengeCard"
import { CreateChallengeModal } from "./CreateChallengeModal"
import { ChallengeDetailsModal } from "./ChallengeDetailsModal"
import type { Challenge } from "@/lib/challenges"

export function ChallengesGrid({ challenges }: { challenges: Challenge[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  const active = challenges.filter(c => c.status === 'active')
  const completed = challenges.filter(c => c.status === 'completed')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-2 font-serif text-ink-900">Tus Desafíos</h2>
          <p className="text-ink-600 mt-1">
            {active.length} activos • {completed.length} completados
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Desafío
        </button>
      </div>

      {/* Activos */}
      {active.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-ink-900 mb-4">Activos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClick={() => setSelectedChallenge(challenge)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completados */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-ink-900 mb-4">Completados</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onClick={() => setSelectedChallenge(challenge)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {challenges.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-heading-3 font-serif text-ink-900 mb-3">No tienes desafíos</h3>
          <p className="text-ink-600 mb-6">Crea tu primer desafío y establece metas de lectura</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Crear Primer Desafío
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateChallengeModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      {selectedChallenge && (
        <ChallengeDetailsModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  )
}