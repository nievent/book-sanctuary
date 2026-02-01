"use client"

import { SlidersHorizontal, ArrowUpDown, Search, X } from "lucide-react"
import { useState } from "react"

export type FilterBarProps = {
  onFilterChange: (filter: string) => void
  onSortChange: (sort: string) => void
  onSearchChange: (search: string) => void
  currentFilter: string
  currentSort: string
  currentSearch: string
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
  onSearchChange,
  currentFilter, 
  currentSort,
  currentSearch,
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

  const handleClearSearch = () => {
    onSearchChange('')
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
        <input
          type="text"
          value={currentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por título o autor..."
          className="w-full pl-12 pr-12 py-3 border border-ink-200 rounded-lg text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 transition-all"
        />
        {currentSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 hover:text-ink-600 transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

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

      {/* Indicador de resultados de búsqueda */}
      {currentSearch && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sage-50 rounded-lg border border-sage-200">
          <Search className="w-4 h-4 text-sage-700" />
          <p className="text-sm text-sage-700">
            Buscando: <strong>"{currentSearch}"</strong>
          </p>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-sm text-sage-600 hover:text-sage-800 underline"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  )
}