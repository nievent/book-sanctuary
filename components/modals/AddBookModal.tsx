"use client"

import { X, Search, Loader2 } from "lucide-react"
import { createBook } from "@/app/actions/books"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { searchBooks, GoogleBook, getCoverUrlSync } from "@/lib/google-books"
import { RatingInput } from "@/components/ui/RatingInput"

export function AddBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [status, setStatus] = useState("to_read")
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchBooks(searchQuery)
      setSearchResults(results)
      setSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Asegurar que la portada esté en el FormData
    if (coverUrl) {
      formData.set('cover_url', coverUrl)
    }
    
    const result = await createBook(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Libro añadido correctamente!')
      onClose()
      setSearchQuery("")
      setSelectedBook(null)
      setSearchResults([])
      setManualMode(false)
      setStatus("to_read")
      setCoverUrl(null)
    }

    setLoading(false)
  }

  function selectBook(book: GoogleBook) {
    setSelectedBook(book)
    setSearchResults([])
    
    // Obtener la mejor portada disponible
    const cover = getCoverUrlSync(book, 'L')
    setCoverUrl(cover)
  }

  function getCoverPreview(book: GoogleBook): string | null {
    return getCoverUrlSync(book, 'M')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-elevated max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-heading-3 font-serif text-ink-900">
              Añadir Nuevo Libro
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              Busca tu libro o añádelo manualmente
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-cream-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-ink-600" />
          </button>
        </div>

        <div className="p-8">
          {!manualMode && !selectedBook && (
            <>
              {/* Barra de búsqueda */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busca por título, autor o ISBN..."
                    className="input-elegant pl-12 pr-4"
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-ink-600">
                    {searchResults.length} resultados encontrados
                  </p>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {searchResults.map((book) => {
                      const cover = getCoverPreview(book)
                      return (
                        <button
                          key={book.id}
                          onClick={() => selectBook(book)}
                          className="flex gap-4 p-4 bg-cream-50 hover:bg-cream-100 rounded-lg transition-colors text-left"
                        >
                          <div className="w-16 h-24 flex-shrink-0 bg-cream-200 rounded overflow-hidden">
                            {cover ? (
                              <img 
                                src={cover} 
                                alt={book.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-ink-500 p-2 text-center">
                                Sin portada
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-ink-900 line-clamp-2 mb-1">
                              {book.title}
                            </h3>
                            <p className="text-sm text-ink-600 mb-2">
                              {book.authors.join(', ')}
                            </p>
                            <div className="flex gap-3 text-xs text-ink-500">
                              {book.pageCount && (
                                <span>{book.pageCount} páginas</span>
                              )}
                              {book.isbn13 && (
                                <span>ISBN: {book.isbn13}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setManualMode(true)}
                  className="text-sm text-ink-600 hover:text-ink-900 underline"
                >
                  ¿No encuentras tu libro? Añádelo manualmente
                </button>
              </div>
            </>
          )}

          {/* Formulario */}
          {(manualMode || selectedBook) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedBook && (
                <div className="flex gap-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
                  <div className="w-20 h-28 flex-shrink-0 bg-cream-200 rounded overflow-hidden">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt={selectedBook.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-ink-500 p-2 text-center">
                        Sin portada
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-ink-900 mb-1">
                      {selectedBook.title}
                    </h3>
                    <p className="text-sm text-ink-600 mb-2">
                      {selectedBook.authors.join(', ')}
                    </p>
                    {selectedBook.isbn13 && (
                      <p className="text-xs text-ink-500 mb-2">
                        ISBN: {selectedBook.isbn13}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(null)
                        setSearchQuery("")
                        setCoverUrl(null)
                      }}
                      className="text-xs text-ink-500 hover:text-ink-700 underline"
                    >
                      Cambiar libro
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={selectedBook?.title || ""}
                    placeholder="El nombre del viento"
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
                    defaultValue={selectedBook?.authors.join(', ') || ""}
                    placeholder="Patrick Rothfuss"
                    className="input-elegant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Estado
                  </label>
                  <select 
                    name="status" 
                    className="input-elegant"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
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
                    defaultValue={selectedBook?.pageCount || ""}
                    placeholder="662"
                    className="input-elegant"
                  />
                </div>

                {status === 'reading' && (
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      name="started_at"
                      className="input-elegant"
                    />
                  </div>
                )}

                {status === 'completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        name="started_at"
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
                        className="input-elegant"
                      />
                    </div>
                  </>
                )}

                <input 
                  type="hidden" 
                  name="cover_url" 
                  value={coverUrl || ""} 
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Puntuación (opcional)
                  </label>
                  <RatingInput name="rating" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Tus pensamientos sobre el libro..."
                    className="input-elegant resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBook) {
                      setSelectedBook(null)
                      setSearchQuery("")
                      setCoverUrl(null)
                    } else {
                      onClose()
                    }
                  }}
                  className="btn-ghost"
                >
                  {selectedBook ? 'Volver a buscar' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Guardando...' : 'Añadir Libro'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}