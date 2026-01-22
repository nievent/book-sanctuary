"use client"

import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { useState } from "react"

export type FilterBarProps = {
  onFilterChange: (filter: string) => void
  onSortChange: (sort: string) => void
  currentFilter: string
  currentSort: string
  stats: {
    total: number
    reading: number
    completed: number
    toRead: number
  } | null
}

export function FilterBar({ 
  onFilterChange, 
  onSortChange, 
  currentFilter, 
  currentSort,
  stats 
}: FilterBarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)

  const filters = [
    { id: 'all', label: 'Todos', count: stats?.total || 0 },
    { id: 'reading', label: 'Leyendo', count: stats?.reading || 0 },
    { id: 'completed', label: 'Completados', count: stats?.completed || 0 },
    { id: 'to_read', label: 'Por leer', count: stats?.toRead || 0 },
  ]

  const sortOptions = [
    { id: 'date_desc', label: 'Más recientes primero' },
    { id: 'date_asc', label: 'Más antiguos primero' },
    { id: 'rating_desc', label: 'Mejor puntuados' },
    { id: 'rating_asc', label: 'Peor puntuados' },
    { id: 'title_asc', label: 'Título (A-Z)' },
    { id: 'title_desc', label: 'Título (Z-A)' },
    { id: 'completed_desc', label: 'Completados recientemente' },
  ]

  const getCurrentSortLabel = () => {
    return sortOptions.find(opt => opt.id === currentSort)?.label || 'Ordenar por'
  }

  return (
    <div className="space-y-4">
      {/* Filtros por estado */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 text-ink-600 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        
        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                currentFilter === filter.id
                  ? 'bg-ink-900 text-white shadow-md'
                  : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
              }`}
            >
              {filter.label}
              <span className={`ml-2 text-xs ${
                currentFilter === filter.id ? 'text-white/80' : 'text-ink-500'
              }`}>
                ({filter.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ordenamiento */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-ink-600 flex-shrink-0">
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm font-medium">Ordenar:</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="px-4 py-2 bg-cream-100 hover:bg-cream-200 rounded-lg text-sm font-medium text-ink-700 transition-colors flex items-center gap-2"
          >
            {getCurrentSortLabel()}
            <svg 
              className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSortMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-ink-100 py-2 z-20 animate-scale-in">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSortChange(option.id)
                      setShowSortMenu(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      currentSort === option.id
                        ? 'bg-sage-50 text-ink-900 font-medium'
                        : 'text-ink-700 hover:bg-cream-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}