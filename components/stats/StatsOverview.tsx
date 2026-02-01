"use client"

import { Book, TrendingUp, Star, Calendar } from "lucide-react"

type GeneralStats = {
  total: number
  reading: number
  completed: number
  toRead: number
  totalPagesRead: number
  pagesInProgress: number
  avgPagesPerBook: number
  avgRating: number
  avgReadingDays: number
  completedThisMonth: number
}

export function StatsOverview({ 
  stats
}: { 
  stats: GeneralStats
}) {
  const statCards = [
    {
      label: "Páginas Totales Leídas",
      value: stats.totalPagesRead.toLocaleString(),
      icon: Book,
      color: "from-purple-500 to-purple-700",
      subtext: `+${stats.pagesInProgress} en progreso`,
    },
    {
      label: "Promedio por Libro",
      value: stats.avgPagesPerBook,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-700",
      subtext: `${stats.completed} libros completados`,
    },
    {
      label: "Valoración Media",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
      icon: Star,
      color: "from-amber-500 to-amber-700",
      subtext: stats.avgRating > 0 ? "sobre 10" : "Sin valoraciones aún",
    },
    {
      label: "Completados Este Mes",
      value: stats.completedThisMonth,
      icon: Calendar,
      color: "from-emerald-500 to-emerald-700",
      subtext: stats.completedThisMonth === 1 ? "libro" : "libros",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div 
            key={stat.label}
            className="card group hover:scale-105 transition-transform cursor-default"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <p className="text-3xl font-bold font-serif text-ink-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-ink-700 mb-1">
              {stat.label}
            </p>
            <p className="text-xs text-ink-500">
              {stat.subtext}
            </p>
          </div>
        )
      })}
    </div>
  )
}