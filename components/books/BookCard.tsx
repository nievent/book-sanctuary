"use client"

import { Heart, MoreVertical, Star } from "lucide-react"
import { toggleFavorite } from "@/app/actions/books"
import { toast } from "sonner"
import { useState } from "react"
import { BookDetailsModal } from "@/components/modals/BookDetailsModal"

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
}

export function BookCard({ book }: { book: Book }) {
  const [showDetails, setShowDetails] = useState(false)
  const progress = book.pages && book.current_page 
    ? (book.current_page / book.pages) * 100 
    : 0

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    const result = await toggleFavorite(book.id, !book.favorite)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(book.favorite ? 'Eliminado de favoritos' : 'Añadido a favoritos')
    }
  }

  return (
    <>
      <div 
        onClick={() => setShowDetails(true)}
        className="book-cover group cursor-pointer"
      >
        {/* Portada */}
        <div className="aspect-book bg-gradient-to-br from-cream-200 to-cream-300 relative overflow-hidden">
          {book.cover_url ? (
            <img 
              src={book.cover_url} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="font-serif text-center text-ink-700 text-sm line-clamp-4">
                {book.title}
              </p>
            </div>
          )}

          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart 
                  className={`w-4 h-4 ${book.favorite ? 'fill-rose-500 text-rose-500' : 'text-ink-700'}`}
                />
              </button>
            </div>

            {/* Rating si existe */}
            {book.rating && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-ink-900">{book.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {book.status === 'reading' && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
              <div 
                className="h-full bg-sage-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Info del libro */}
        <div className="mt-3 space-y-1">
          <h3 className="font-serif font-medium text-ink-900 line-clamp-2 text-sm">
            {book.title}
          </h3>
          <p className="text-xs text-ink-500 line-clamp-1">
            {book.author}
          </p>
          
          {book.status === 'reading' && book.pages && (
            <p className="text-xs text-sage-600 font-medium">
              {book.current_page || 0} / {book.pages} páginas
            </p>
          )}
        </div>

        {/* Badge de estado */}
        <div className="mt-2">
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
      </div>

      <BookDetailsModal 
        book={book}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}