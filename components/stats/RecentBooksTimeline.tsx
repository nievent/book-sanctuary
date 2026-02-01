"use client"

import { Star, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type RecentBook = {
  id: string
  title: string
  author: string
  rating: number | null
  pages: number | null
  completed_at: string | null
}

export function RecentBooksTimeline({ books }: { books: RecentBook[] }) {
  if (books.length === 0) {
    return (
      <div className="card">
        <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
          Últimos Libros Completados
        </h3>
        <div className="text-center py-12">
          <p className="text-ink-500">
            Aún no has completado ningún libro
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        Últimos Libros Completados
      </h3>

      <div className="space-y-4">
        {books.map((book, index) => (
          <div 
            key={book.id}
            className="flex gap-4 p-4 bg-cream-50 hover:bg-cream-100 rounded-lg transition-colors group"
          >
            {/* Número */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>

            {/* Info del libro */}
            <div className="flex-1 min-w-0">
              <h4 className="font-serif font-medium text-ink-900 mb-1 group-hover:text-sage-700 transition-colors">
                {book.title}
              </h4>
              <p className="text-sm text-ink-600 mb-2">
                {book.author}
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs text-ink-500">
                {book.completed_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(book.completed_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                )}
                
                {book.pages && (
                  <span>
                    {book.pages} páginas
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {book.rating && (
              <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-ink-100">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-ink-900">
                  {book.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
