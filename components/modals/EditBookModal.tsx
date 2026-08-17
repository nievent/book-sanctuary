"use client"

import { Loader2, Search, X } from "lucide-react"
import { updateBook } from "@/app/actions/books"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { RatingInput } from "@/components/ui/RatingInput"
import { CoverInput } from "@/components/modals/AddBookModal"
import { getCoverUrlSync, GoogleBook, searchBooks } from "@/lib/google-books"

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

function toDateInput(dateString: string | null | undefined): string {
  if (!dateString) return ""
  // Parsear sin conversión de zona horaria: coger solo YYYY-MM-DD
  return dateString.slice(0, 10)
}

export function EditBookModal({
  book,
  isOpen,
  onClose,
}: {
  book: Book
  isOpen: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(book.cover_url)
  const [coverSearchQuery, setCoverSearchQuery] = useState("")
  const [coverSearchResults, setCoverSearchResults] = useState<GoogleBook[]>([])
  const [searchingCovers, setSearchingCovers] = useState(false)
  // Campos controlados para evitar el problema de defaultValue en inputs de fecha
  const [startedAt, setStartedAt] = useState(toDateInput(book.started_at))
  const [completedAt, setCompletedAt] = useState(toDateInput(book.completed_at))

  useEffect(() => {
    if (!isOpen) return

    setCoverUrl(book.cover_url)
    setCoverSearchQuery(`${book.title} ${book.author}`)
    setCoverSearchResults([])
    setStartedAt(toDateInput(book.started_at))
    setCompletedAt(toDateInput(book.completed_at))
  }, [book, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Sobreescribir con los valores controlados para garantizar que se envían
    // aunque el browser no haya inicializado bien el input[type=date]
    formData.set("started_at", startedAt)
    formData.set("completed_at", completedAt)
    formData.set("cover_url", coverUrl || "")

    const result = await updateBook(book.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("¡Libro actualizado!")
      onClose()
    }

    setLoading(false)
  }

  async function handleCoverSearch() {
    const query = coverSearchQuery.trim()
    if (query.length < 3) {
      toast.error("Escribe al menos 3 caracteres para buscar una portada")
      return
    }

    setSearchingCovers(true)
    try {
      setCoverSearchResults(await searchBooks(query))
    } catch {
      toast.error("No se pudieron buscar portadas")
    } finally {
      setSearchingCovers(false)
    }
  }

  function selectCover(result: GoogleBook) {
    const cover = getCoverUrlSync(result, "L")
    if (!cover) {
      toast.error("Este resultado no tiene una portada disponible")
      return
    }

    setCoverUrl(cover)
    setCoverSearchResults([])
    toast.success("Portada seleccionada")
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
            <h2 className="text-heading-3 font-serif text-ink-900">Editar Libro</h2>
            <p className="text-sm text-ink-500 mt-1">Actualiza la información del libro</p>
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
                <label className="block text-sm font-medium text-ink-700 mb-2">Título *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={book.title}
                  className="input-elegant"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">Autor *</label>
                <input
                  type="text"
                  name="author"
                  required
                  defaultValue={book.author}
                  className="input-elegant"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">Portada</label>
                <div className="mb-3 rounded-lg border border-cream-200 bg-cream-50 p-3">
                  <p className="mb-2 text-sm font-medium text-ink-700">Buscar portada en la API</p>
                  <div className="flex gap-2">
                    <input
                      type="search"
                      value={coverSearchQuery}
                      onChange={(e) => setCoverSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleCoverSearch()
                        }
                      }}
                      placeholder="Título, autor o ISBN"
                      className="input-elegant min-w-0 flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCoverSearch}
                      disabled={searchingCovers}
                      className="btn-ghost shrink-0"
                    >
                      {searchingCovers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Buscar
                    </button>
                  </div>

                  {coverSearchResults.length > 0 && (
                    <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                      {coverSearchResults.map((result, index) => {
                        const resultCover = getCoverUrlSync(result, "M")
                        return (
                          <button
                            key={`${result.id}-${index}`}
                            type="button"
                            onClick={() => selectCover(result)}
                            className="flex gap-2 rounded-lg bg-white p-2 text-left transition-colors hover:bg-sage-50"
                          >
                            <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-cream-200">
                              {resultCover ? <img src={resultCover} alt="" className="h-full w-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-xs font-medium text-ink-900">{result.title}</p>
                              <p className="mt-1 line-clamp-1 text-xs text-ink-500">{result.authors.join(", ")}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <CoverInput coverUrl={coverUrl} onChange={setCoverUrl} />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Estado</label>
                <select name="status" defaultValue={book.status} className="input-elegant">
                  <option value="to_read">Por leer</option>
                  <option value="reading">Leyendo</option>
                  <option value="completed">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Número de páginas</label>
                <input
                  type="number"
                  name="pages"
                  defaultValue={book.pages || ""}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Página actual</label>
                <input
                  type="number"
                  name="current_page"
                  defaultValue={book.current_page || ""}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Favorito</label>
                <select
                  name="favorite"
                  defaultValue={book.favorite ? "true" : "false"}
                  className="input-elegant"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>

              {/* Fechas: inputs CONTROLADOS para que FormData siempre tenga el valor correcto */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de inicio</label>
                <input
                  type="date"
                  name="started_at"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className="input-elegant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de finalización</label>
                <input
                  type="date"
                  name="completed_at"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="input-elegant"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">Puntuación (opcional)</label>
                <RatingInput name="rating" value={book.rating} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-2">Notas (opcional)</label>
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
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
