"use client"

import { Star, Book } from "lucide-react"

type AuthorStat = {
  author: string
  count: number
  avgRating?: number
}

type AuthorRankingProps = {
  topByCount: AuthorStat[]
  topByRating: AuthorStat[]
}

export function AuthorRanking({ topByCount, topByRating }: AuthorRankingProps) {
  const maxCount = Math.max(...topByCount.map(a => a.count), 1)

  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        🏆 Ranking de Autores
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top por cantidad de libros */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Book className="w-5 h-5 text-sage-600" />
            <h4 className="font-medium text-ink-900">
              Más Leídos
            </h4>
          </div>

          {topByCount.length > 0 ? (
            <div className="space-y-3">
              {topByCount.map((author, index) => (
                <div key={author.author} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sage-600 w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-ink-900 truncate">
                        {author.author}
                      </span>
                    </div>
                    <span className="text-ink-600 font-semibold flex-shrink-0">
                      {author.count} {author.count === 1 ? 'libro' : 'libros'}
                    </span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full transition-all duration-500"
                      style={{ width: `${(author.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500 italic">
              Completa más libros para ver el ranking
            </p>
          )}
        </div>

        {/* Top por valoración */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h4 className="font-medium text-ink-900">
              Mejor Valorados
            </h4>
          </div>

          {topByRating.length > 0 ? (
            <div className="space-y-3">
              {topByRating.map((author, index) => (
                <div key={author.author} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-amber-600 w-6 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-ink-900 truncate">
                        {author.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-ink-900 font-semibold">
                        {author.avgRating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${((author.avgRating || 0) / 10) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-ink-500">
                    {author.count} {author.count === 1 ? 'libro' : 'libros'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500 italic">
              Valora tus libros para ver este ranking
            </p>
          )}
        </div>
      </div>

      {/* Estadística adicional */}
      {topByCount.length > 0 && (
        <div className="mt-6 pt-6 border-t border-ink-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-sage-50 rounded-lg">
              <p className="text-sm text-ink-600 mb-1">Autores únicos</p>
              <p className="text-2xl font-bold text-sage-700">
                {topByCount.length}
              </p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-ink-600 mb-1">Autor favorito</p>
              <p className="text-lg font-bold text-amber-700 truncate px-2">
                {topByCount[0]?.author || '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}