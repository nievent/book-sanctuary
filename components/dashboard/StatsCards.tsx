"use client"

import { BookOpen, CheckCircle, Heart, Library } from "lucide-react"

type Stats = {
  total: number
  reading: number
  completed: number
  toRead: number
  favorites: number
  totalPages: number
  pagesRead: number
} | null

export function StatsCards({ stats }: { stats: Stats }) {
  if (!stats) return null

  const statCards = [
    {
      label: "Total de libros",
      value: stats.total,
      icon: Library,
      color: "from-ink-600 to-ink-800",
    },
    {
      label: "Leyendo ahora",
      value: stats.reading,
      icon: BookOpen,
      color: "from-sage-500 to-sage-700",
    },
    {
      label: "Completados",
      value: stats.completed,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-700",
    },
    {
      label: "Favoritos",
      value: stats.favorites,
      icon: Heart,
      color: "from-rose-500 to-rose-700",
    },
  ]

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-in">
      {statCards.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div 
            key={stat.label}
            className="card group hover:scale-105 transition-transform cursor-default"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold font-serif text-ink-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-ink-500">
              {stat.label}
            </p>
          </div>
        )
      })}
    </section>
  )
}