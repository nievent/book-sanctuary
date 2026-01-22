"use client"

import { X } from "lucide-react"
import { updateBook } from "@/app/actions/books"
import { toast } from "sonner"
import { useState } from "react"
import { RatingInput } from "@/components/ui/RatingInput"

type Book = {
  id: string
  title: string
  author: string
  status: string
  cover_url: string | null
  rating: number | null
  pages: number | null
  current_page: number | null
  favorite: boolean
  notes?: string | null
  started_at?: string | null
  completed_at?: string | null
}

export function EditBookModal({ 
  book, 
  isOpen, 
  onClose 
}: { 
  book: Book
  isOpen: boolean
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateBook(book.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Libro actualizado!')
      onClose()
    }

    setLoading(false)
  }

  // Formatear fechas para el input date
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-heading-3 font-serif text-ink-900">
              Editar Libro
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              Actualiza la información del libro
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-cream-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-ink-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={book.title}
                  className="input-elegant"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Autor *
                </label>
                <input
                  type="text"
                  name="author"
                  required
                  defaultValue={book.author}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Estado
                </label>
                <select 
                  name="status" 
                  defaultValue={book.status}
                  className="input-elegant"
                >
                  <option value="to_read">Por leer</option>
                  <option value="reading">Leyendo</option>
                  <option value="completed">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Número de páginas
                </label>
                <input
                  type="number"
                  name="pages"
                  defaultValue={book.pages || ""}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Página actual
                </label>
                <input
                  type="number"
                  name="current_page"
                  defaultValue={book.current_page || ""}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Favorito
                </label>
                <select 
                  name="favorite" 
                  defaultValue={book.favorite ? "true" : "false"}
                  className="input-elegant"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  name="started_at"
                  defaultValue={formatDateForInput(book.started_at)}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  name="completed_at"
                  defaultValue={formatDateForInput(book.completed_at)}
                  className="input-elegant"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Puntuación (opcional)
                </label>
                <RatingInput 
                  name="rating" 
                  value={book.rating}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={book.notes || ""}
                  placeholder="Tus pensamientos sobre el libro..."
                  className="input-elegant resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-ink-100">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}