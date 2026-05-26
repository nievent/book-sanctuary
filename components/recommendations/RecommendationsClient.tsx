// components/recommendations/RecommendationsClient.tsx
"use client"

import { useState } from "react"
import { Sparkles, BookOpen, Clock, Loader2, RefreshCw, Star } from "lucide-react"
import { getRecommendations, type BookRecommendation } from "@/app/actions/recommendations"
import { searchBooks } from "@/lib/google-books"

// ─── Opciones ─────────────────────────────────────────────────────────────────

const GENRES = [
  { id: 'all',              label: 'Sorpréndeme',     emoji: '✨' },
  { id: 'fantasía',         label: 'Fantasía',        emoji: '🧙' },
  { id: 'ciencia ficción',  label: 'Ciencia Ficción', emoji: '🚀' },
  { id: 'romance',          label: 'Romance',         emoji: '💕' },
  { id: 'clásicos',         label: 'Clásicos',        emoji: '📜' },
  { id: 'thriller',         label: 'Thriller',        emoji: '🔪' },
  { id: 'terror',           label: 'Terror',          emoji: '👻' },
  { id: 'histórica',        label: 'Histórica',       emoji: '🏰' },
  { id: 'aventura',         label: 'Aventura',        emoji: '🗺️' },
  { id: 'misterio',         label: 'Misterio',        emoji: '🔍' },
  { id: 'no ficción',       label: 'No ficción',      emoji: '📊' },
  { id: 'poesía',           label: 'Poesía',          emoji: '🎭' },
]

const LENGTHS = [
  { id: 'all',    label: 'Cualquier extensión', sublabel: '',            emoji: '📚' },
  { id: 'short',  label: 'Corto',               sublabel: '< 200 págs', emoji: '⚡' },
  { id: 'medium', label: 'Medio',               sublabel: '200–400 págs', emoji: '📗' },
  { id: 'long',   label: 'Largo',               sublabel: '400–600 págs', emoji: '📘' },
  { id: 'epic',   label: 'Épico',               sublabel: '> 600 págs', emoji: '🏔️' },
]

// ─── Componente de portada lazy ───────────────────────────────────────────────

function BookCover({ title, author, staticUrl }: { title: string; author: string; staticUrl?: string | null }) {
  const [src, setSrc] = useState<string | null>(staticUrl || null)
  const [tried, setTried] = useState(!!staticUrl)

  // Si no tenemos portada estática, buscar al montar
  if (!tried) {
    setTried(true)
    searchBooks(`${title} ${author}`)
      .then(results => {
        const cover = results[0]?.googleImageLink
        if (cover) setSrc(cover)
      })
      .catch(() => {})
  }

  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        onError={() => setSrc(null)}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-cream-200 to-cream-300">
      <p className="font-serif text-center text-ink-700 text-sm line-clamp-4 leading-snug">
        {title}
      </p>
    </div>
  )
}

// ─── Skeleton de carga ────────────────────────────────────────────────────────

function RecommendationSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-book bg-cream-200 rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-cream-200 rounded w-3/4" />
        <div className="h-3 bg-cream-200 rounded w-1/2" />
        <div className="h-3 bg-cream-200 rounded w-1/4 mt-3" />
        <div className="space-y-1 mt-2">
          <div className="h-3 bg-cream-200 rounded" />
          <div className="h-3 bg-cream-200 rounded" />
          <div className="h-3 bg-cream-200 rounded w-4/5" />
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de recomendación ─────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: BookRecommendation; index: number }) {
  return (
    <div
      className="card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col animate-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Portada */}
      <div className="aspect-book rounded-lg overflow-hidden mb-4 shadow-soft relative flex-shrink-0">
        <BookCover title={rec.title} author={rec.author} staticUrl={rec.cover_url} />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 space-y-2">
        <h3 className="font-serif font-semibold text-ink-900 leading-snug line-clamp-2">
          {rec.title}
        </h3>
        <p className="text-sm text-ink-600">{rec.author}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="badge badge-reading text-xs">{rec.genre}</span>
          {rec.approximate_pages > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-500">
              <BookOpen className="w-3 h-3" />
              ~{rec.approximate_pages} págs
            </span>
          )}
        </div>

        <p className="text-xs text-ink-600 leading-relaxed pt-1 flex-1 italic border-t border-cream-200 pt-3">
          "{rec.reason}"
        </p>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RecommendationsClient({ ratedBooksCount }: { ratedBooksCount: number }) {
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedLength, setSelectedLength] = useState('all')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<BookRecommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const canGenerate = ratedBooksCount > 0

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setRecommendations(null)

    const result = await getRecommendations({
      genre: selectedGenre,
      length: selectedLength,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setRecommendations(result.recommendations ?? null)
      setHasGenerated(true)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-10 animate-in">
      {/* Header */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-heading-1 font-serif text-ink-900">Recomendaciones</h1>
          </div>
        </div>
        <p className="text-body-lg text-ink-600 max-w-xl">
          La IA analiza tus libros y puntuaciones para encontrar tu próxima lectura perfecta.
        </p>
        {ratedBooksCount > 0 && (
          <p className="text-sm text-sage-600 mt-2 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-sage-500 text-sage-500" />
            Basado en {ratedBooksCount} {ratedBooksCount === 1 ? 'libro valorado' : 'libros valorados'}
          </p>
        )}
      </section>

      {/* Filtros */}
      <section className="card space-y-6">
        {/* Género */}
        <div>
          <p className="text-sm font-semibold text-ink-700 mb-3">¿Qué género te apetece?</p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedGenre === g.id
                    ? 'bg-ink-900 text-white shadow-md scale-105'
                    : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                }`}
              >
                <span>{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extensión */}
        <div>
          <p className="text-sm font-semibold text-ink-700 mb-3">¿Cuánto quieres leer?</p>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLength(l.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLength === l.id
                    ? 'bg-ink-900 text-white shadow-md scale-105'
                    : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                }`}
              >
                <span>{l.emoji}</span>
                <span>{l.label}</span>
                {l.sublabel && (
                  <span className={`text-xs ${selectedLength === l.id ? 'text-white/70' : 'text-ink-400'}`}>
                    {l.sublabel}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Botón */}
        <div className="pt-2 border-t border-cream-200">
          {!canGenerate ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-2xl">📚</span>
              <p className="text-sm text-amber-800">
                Completa y valora al menos un libro para recibir recomendaciones personalizadas.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary flex items-center gap-2 shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando tus gustos…
                </>
              ) : hasGenerated ? (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Nuevas recomendaciones
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar recomendaciones
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Skeletons mientras carga */}
      {loading && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
            <p className="text-ink-600 text-sm">
              La IA está analizando tu biblioteca y buscando los libros perfectos para ti…
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecommendationSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Resultados */}
      {!loading && recommendations && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-heading-3 font-serif text-ink-900">
                {GENRES.find(g => g.id === selectedGenre)?.emoji}{' '}
                Libros recomendados para ti
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                {selectedGenre !== 'all' && `Género: ${GENRES.find(g => g.id === selectedGenre)?.label} · `}
                {selectedLength !== 'all' && `${LENGTHS.find(l => l.id === selectedLength)?.label} · `}
                {recommendations.length} recomendaciones
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={`${rec.title}-${i}`} rec={rec} index={i} />
            ))}
          </div>

          <p className="text-xs text-ink-400 text-center mt-8 italic">
            Recomendaciones generadas por IA basadas en tus valoraciones · Los resultados pueden variar
          </p>
        </section>
      )}
    </div>
  )
}