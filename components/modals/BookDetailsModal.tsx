"use client"

import { X, Trash2, Edit, Star } from "lucide-react"
import { deleteBook, updateProgress } from "@/app/actions/books"
import { toast } from "sonner"
import { useState } from "react"

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
}

export function BookDetailsModal({ 
  book, 
  isOpen, 
  onClose 
}: { 
  book: Book
  isOpen: boolean
  onClose: () => void 
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentPage, setCurrentPage] = useState(book.current_page || 0)

  if (!isOpen) return null

  async function handleDelete() {
    const result = await deleteBook(book.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Libro eliminado')
      onClose()
    }
  }

  async function handleUpdateProgress() {
    if (!book.pages) return
    
    const result = await updateProgress(book.id, currentPage)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Progreso actualizado')
    }
  }

  const progress = book.pages && book.current_page 
    ? Math.round((book.current_page / book.pages) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="grid md:grid-cols-5 gap-8 p-8">
          {/* Portada */}
          <div className="md:col-span-2">
            <div className="aspect-book bg-gradient-to-br from-cream-200 to-cream-300 rounded-xl overflow-hidden shadow-lg sticky top-0">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <p className="font-serif text-center text-ink-700 text-lg">
                    {book.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detalles */}
          <div className="md:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-heading-2 font-serif text-ink-900 mb-2">
                    {book.title}
                  </h2>
                  <p className="text-body-lg text-ink-600">
                    por {book.author}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-cream-100 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-ink-600" />
                </button>
              </div>

              {/* Rating */}
              {book.rating && (
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-5 h-5 ${
                        i < book.rating! 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-ink-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-ink-500 mb-1">Estado</p>
                <span className={`badge ${
                  book.status === 'reading' ? 'badge-reading' :
                  book.status === 'completed' ? 'badge-completed' :
                  'badge-to-read'
                }`}>
                  {book.status === 'reading' ? 'Leyendo' :
                   book.status === 'completed' ? 'Completado' :
                   'Por leer'}
                </span>
              </div>

              {book.pages && (
                <div>
                  <p className="text-sm font-medium text-ink-500 mb-1">
                    Páginas
                  </p>
                  <p className="text-ink-900">{book.pages} páginas</p>
                </div>
              )}

              {/* Progreso */}
              {book.status === 'reading' && book.pages && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-ink-500">
                      Progreso de lectura
                    </p>
                    <p className="text-sm font-medium text-sage-600">
                      {progress}%
                    </p>
                  </div>
                  
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-sage-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      min={0}
                      max={book.pages}
                      className="input-elegant flex-1"
                      placeholder="Página actual"
                    />
                    <button
                      onClick={handleUpdateProgress}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              )}

              {/* Notas */}
              {book.notes && (
                <div>
                  <p className="text-sm font-medium text-ink-500 mb-2">
                    Notas
                  </p>
                  <div className="card-subtle">
                    <p className="text-ink-700 leading-relaxed whitespace-pre-line">
                      {book.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Actions */}
            <div className="flex gap-3">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-ghost text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <p className="text-sm text-ink-600">¿Estás seguro?</p>
                  <button
                    onClick={handleDelete}
                    className="btn-ghost text-red-600 hover:bg-red-50"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-ghost"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}