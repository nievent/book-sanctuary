"use client"

import { X, Search, Loader2, Link as LinkIcon, Upload, Image as ImageIcon } from "lucide-react"
import { createBook } from "@/app/actions/books"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { searchBooks, GoogleBook, getCoverUrlSync } from "@/lib/google-books"
import { RatingInput } from "@/components/ui/RatingInput"
import { createClient } from "@/lib/supabase/client"

// ─── Cover input ──────────────────────────────────────────────────────────────

type CoverInputProps = {
  coverUrl: string | null
  onChange: (url: string | null) => void
}

function CoverInput({ coverUrl, onChange }: CoverInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [urlValue, setUrlValue] = useState(coverUrl || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setUrlValue(val)
    onChange(val.trim() || null)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5 MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(filename, file, { upsert: false })

      if (error) {
        // Si el bucket no existe, usar preview local como fallback
        console.warn('Storage error, using local preview:', error.message)
        const objectUrl = URL.createObjectURL(file)
        onChange(objectUrl)
        toast.info('Portada cargada localmente (configura el bucket "book-covers" en Supabase para guardarla)')
        return
      }

      const { data: publicData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(data.path)

      onChange(publicData.publicUrl)
      toast.success('Portada subida correctamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'url'
              ? 'bg-ink-900 text-white'
              : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'upload'
              ? 'bg-ink-900 text-white'
              : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Subir imagen
        </button>
        {coverUrl && (
          <button
            type="button"
            onClick={() => { onChange(null); setUrlValue('') }}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            Quitar portada
          </button>
        )}
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={urlValue}
          onChange={handleUrlChange}
          placeholder="https://ejemplo.com/portada.jpg"
          className="input-elegant text-sm"
        />
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-200 rounded-lg text-sm text-ink-600 hover:border-sage-400 hover:text-sage-600 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
            ) : (
              <><ImageIcon className="w-4 h-4" /> Seleccionar imagen (JPG, PNG, WebP — máx. 5 MB)</>
            )}
          </button>
        </>
      )}

      {/* Preview */}
      {coverUrl && (
        <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg border border-cream-200">
          <img
            src={coverUrl}
            alt="Preview portada"
            className="w-12 h-16 object-cover rounded shadow-sm"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <p className="text-xs text-ink-600 break-all line-clamp-2">{coverUrl}</p>
        </div>
      )}
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function AddBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [status, setStatus] = useState("to_read")
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [showCoverInput, setShowCoverInput] = useState(false)

  // Debounce más largo (800ms) y mínimo 3 caracteres para reducir peticiones
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchBooks(searchQuery)
      setSearchResults(results)
      setSearching(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (coverUrl) formData.set('cover_url', coverUrl)

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
      setShowCoverInput(false)
    }

    setLoading(false)
  }

  function selectBook(book: GoogleBook) {
    setSelectedBook(book)
    setSearchResults([])
    const cover = getCoverUrlSync(book, 'L')
    setCoverUrl(cover)
    setShowCoverInput(false)
  }

  function getCoverPreview(book: GoogleBook): string | null {
    return getCoverUrlSync(book, 'M')
  }

  function resetSearch() {
    setSelectedBook(null)
    setSearchQuery("")
    setCoverUrl(null)
    setShowCoverInput(false)
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
                    placeholder="Busca por título, autor o ISBN… (mínimo 3 letras)"
                    className="input-elegant pl-12 pr-4"
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 animate-spin" />
                  )}
                </div>
                {searchQuery.length > 0 && searchQuery.length < 3 && (
                  <p className="text-xs text-ink-400 mt-2 pl-1">
                    Escribe al menos 3 caracteres para buscar
                  </p>
                )}
              </div>

              {/* Resultados */}
              {searchResults.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-ink-600">
                    {searchResults.length} resultados encontrados
                  </p>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {searchResults.map((book, idx) => {
                      const cover = getCoverPreview(book)
                      return (
                        <button
                          key={`${book.id}-${idx}`}
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
                                  e.currentTarget.parentElement!.innerHTML =
                                    '<div class="w-full h-full flex items-center justify-center text-xs text-center p-1 text-stone-500">Sin portada</div>'
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
                              {book.pageCount && <span>{book.pageCount} páginas</span>}
                              {book.publishedDate && <span>{book.publishedDate}</span>}
                              {book.isbn13 && <span>ISBN: {book.isbn13}</span>}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {searchQuery.length >= 3 && !searching && searchResults.length === 0 && (
                <div className="mb-6 p-4 bg-cream-50 rounded-lg text-center">
                  <p className="text-sm text-ink-600">
                    No se encontraron resultados para "{searchQuery}"
                  </p>
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
              {/* Libro seleccionado */}
              {selectedBook && (
                <div className="flex gap-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
                  <div className="w-20 h-28 flex-shrink-0 bg-cream-200 rounded overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
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
                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="text-xs text-ink-500 hover:text-ink-700 underline"
                      >
                        Cambiar libro
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCoverInput(v => !v)}
                        className="text-xs text-sage-600 hover:text-sage-800 underline"
                      >
                        {showCoverInput ? 'Ocultar portada manual' : coverUrl ? 'Cambiar portada' : 'Añadir portada manualmente'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover input: manual mode siempre visible, selected book toggle */}
              {(manualMode || showCoverInput) && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Portada del libro
                  </label>
                  <CoverInput coverUrl={coverUrl} onChange={setCoverUrl} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-2">Título *</label>
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
                  <label className="block text-sm font-medium text-ink-700 mb-2">Autor *</label>
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
                  <label className="block text-sm font-medium text-ink-700 mb-2">Estado</label>
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
                  <label className="block text-sm font-medium text-ink-700 mb-2">Número de páginas</label>
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
                    <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de inicio</label>
                    <input type="date" name="started_at" className="input-elegant" />
                  </div>
                )}

                {status === 'completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de inicio</label>
                      <input type="date" name="started_at" className="input-elegant" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">Fecha de finalización</label>
                      <input type="date" name="completed_at" className="input-elegant" />
                    </div>
                  </>
                )}

                <input type="hidden" name="cover_url" value={coverUrl || ""} />

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
                      resetSearch()
                    } else {
                      onClose()
                    }
                  }}
                  className="btn-ghost"
                >
                  {selectedBook ? 'Volver a buscar' : 'Cancelar'}
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
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