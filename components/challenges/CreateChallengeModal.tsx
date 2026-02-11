// Ruta: components/challenges/CreateChallengeModal.tsx

"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { createChallenge } from "@/app/actions/challenges"
import { toast } from "sonner"
import { CHALLENGE_TEMPLATES, ChallengeType } from "@/lib/challenges"

export function CreateChallengeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ChallengeType>('books_count')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  if (!isOpen) return null

  const currentYear = new Date().getFullYear()
  const today = new Date().toISOString().split('T')[0]
  const endOfYear = `${currentYear}-12-31`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createChallenge(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Desafío creado!')
      onClose()
    }

    setLoading(false)
  }

  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId)
    const template = CHALLENGE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedType(template.type)
    }
  }

  const currentTemplate = CHALLENGE_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-elevated max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-heading-3 font-serif text-ink-900">Crear Nuevo Desafío</h2>
            <p className="text-sm text-ink-500 mt-1">Establece una meta de lectura personalizada</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-cream-100 flex items-center justify-center">
            <X className="w-5 h-5 text-ink-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Templates */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-3">Plantillas Rápidas</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CHALLENGE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-ink-900 bg-ink-50'
                      : 'border-ink-200 hover:border-ink-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <p className="font-medium text-sm text-ink-900 mb-1">{template.title}</p>
                  <p className="text-xs text-ink-500">{template.difficulty === 'easy' ? 'Fácil' : template.difficulty === 'medium' ? 'Medio' : 'Difícil'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <input type="hidden" name="type" value={selectedType} />
            <input type="hidden" name="icon" value={currentTemplate?.icon || '🎯'} />
            <input type="hidden" name="color" value={currentTemplate?.color || 'from-blue-500 to-blue-700'} />

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Título del Desafío *</label>
              <input
                type="text"
                name="title"
                required
                defaultValue={currentTemplate?.title || ''}
                placeholder="Ej: 12 Libros en 2026"
                className="input-elegant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Descripción</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={currentTemplate?.description || ''}
                className="input-elegant resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Meta * {selectedType === 'pages_count' ? '(páginas)' : '(cantidad)'}
                </label>
                <input
                  type="number"
                  name="target_value"
                  required
                  min="1"
                  defaultValue={currentTemplate?.target_value || 12}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de Inicio *</label>
                <input type="date" name="start_date" required defaultValue={today} className="input-elegant" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de Finalización *</label>
              <input type="date" name="end_date" required defaultValue={endOfYear} className="input-elegant" />
            </div>

            {/* Filtros específicos */}
            {selectedType === 'genre' && (
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Género</label>
                <input type="text" name="genre_filter" placeholder="Ej: Fantasía, Ciencia Ficción" className="input-elegant" />
              </div>
            )}

            {selectedType === 'author' && (
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Autor</label>
                <input type="text" name="author_filter" placeholder="Ej: García Márquez" className="input-elegant" />
              </div>
            )}

            {selectedType === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Valoración Mínima (0-10)</label>
                <input type="number" name="min_rating" min="0" max="10" defaultValue="7" className="input-elegant" />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-ink-100">
              <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creando...' : 'Crear Desafío'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}