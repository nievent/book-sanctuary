import { Calendar, Star } from "lucide-react"
import type { PublicUserBook } from "@/app/actions/social"

const STATUS_LABELS: Record<string, string> = {
  reading: "Leyendo",
  completed: "Completado",
  to_read: "Por leer",
}

function formatDate(dateString: string | null) {
  if (!dateString) return null

  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ReadOnlyBookCard({ book }: { book: PublicUserBook }) {
  const progress =
    book.status === "reading" && book.pages && book.current_page
      ? Math.round((book.current_page / book.pages) * 100)
      : 0
  const completedAt = formatDate(book.completed_at)
  const startedAt = formatDate(book.started_at)

  return (
    <article className="bg-white border border-ink-100 rounded-lg shadow-soft overflow-hidden">
      <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] min-h-40">
        <div className="aspect-book bg-gradient-to-br from-cream-200 to-cream-300 overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <p className="font-serif text-center text-ink-700 text-xs line-clamp-5">
                {book.title}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-900 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-ink-600 line-clamp-1">por {book.author}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`badge ${
                book.status === "reading"
                  ? "badge-reading"
                  : book.status === "completed"
                    ? "badge-completed"
                    : "badge-to-read"
              }`}
            >
              {STATUS_LABELS[book.status] ?? book.status}
            </span>

            {book.rating !== null && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {book.rating.toFixed(1)} / 10
              </span>
            )}
          </div>

          {book.status === "reading" && book.pages && (
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-ink-500">
                <span>
                  {book.current_page || 0} / {book.pages} paginas
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                <div className="h-full bg-sage-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {(startedAt || completedAt || book.pages) && (
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
              {book.pages && <span>{book.pages} paginas</span>}
              {startedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Iniciado: {startedAt}
                </span>
              )}
              {completedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Terminado: {completedAt}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
