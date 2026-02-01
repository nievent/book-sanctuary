"use client"

import { Target, BookOpen, Calendar, TrendingUp, Edit2, Check, X } from "lucide-react"
import { useState } from "react"

type GoalsData = {
  booksThisYear: number
  pagesThisYear: number
  avgBooksPerMonth: number
  totalBooks: number
  totalPagesRead: number
}

type Goal = {
  id: string
  title: string
  target: number
  current: number
  unit: string
  icon: typeof Target
  color: string
  period: string
}

export function ReadingGoals({ data }: { data: GoalsData }) {
  // Metas predefinidas (en el futuro estas podrían guardarse en la BD)
  const [yearlyBooksGoal, setYearlyBooksGoal] = useState(24) // 2 libros/mes por defecto
  const [monthlyPagesGoal, setMonthlyPagesGoal] = useState(1000)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState(0)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' })

  // Calcular progreso de páginas este mes (estimado)
  const dayOfMonth = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const estimatedPagesThisMonth = Math.round(data.pagesThisYear * (dayOfMonth / 31)) // Aproximado

  const goals: Goal[] = [
    {
      id: 'yearly-books',
      title: `Libros en ${currentYear}`,
      target: yearlyBooksGoal,
      current: data.booksThisYear,
      unit: 'libros',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-700',
      period: 'año'
    },
    {
      id: 'monthly-pages',
      title: `Páginas en ${currentMonth}`,
      target: monthlyPagesGoal,
      current: estimatedPagesThisMonth,
      unit: 'páginas',
      icon: Target,
      color: 'from-emerald-500 to-emerald-700',
      period: 'mes'
    },
  ]

  const handleEdit = (goalId: string, currentTarget: number) => {
    setEditingGoal(goalId)
    setTempValue(currentTarget)
  }

  const handleSave = (goalId: string) => {
    if (tempValue > 0) {
      if (goalId === 'yearly-books') {
        setYearlyBooksGoal(tempValue)
      } else if (goalId === 'monthly-pages') {
        setMonthlyPagesGoal(tempValue)
      }
    }
    setEditingGoal(null)
  }

  const handleCancel = () => {
    setEditingGoal(null)
    setTempValue(0)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    if (percentage >= 75) return 'bg-gradient-to-r from-blue-500 to-blue-600'
    if (percentage >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-600'
    if (percentage >= 25) return 'bg-gradient-to-r from-orange-500 to-orange-600'
    return 'bg-gradient-to-r from-rose-500 to-rose-600'
  }

  const getMotivationalMessage = (percentage: number, goalTitle: string) => {
    if (percentage >= 100) return `🎉 ¡Meta de ${goalTitle} alcanzada! ¡Increíble!`
    if (percentage >= 75) return `🔥 ¡Casi lo logras! Solo un poco más para ${goalTitle}.`
    if (percentage >= 50) return `💪 ¡Vas por la mitad! Sigue así con ${goalTitle}.`
    if (percentage >= 25) return `📚 Buen comienzo. Continúa trabajando en ${goalTitle}.`
    return `🌱 Acaba de empezar. ¡Tú puedes con ${goalTitle}!`
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-heading-3 font-serif text-ink-900">
              🎯 Objetivos de Lectura
            </h3>
          </div>
          <p className="text-sm text-ink-600 mt-1">
            Establece y sigue tus metas personales
          </p>
        </div>
      </div>

      {/* Tarjetas de objetivos */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {goals.map((goal) => {
          const percentage = getProgressPercentage(goal.current, goal.target)
          const isEditing = editingGoal === goal.id
          const Icon = goal.icon

          return (
            <div 
              key={goal.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-ink-600">{goal.title}</p>
                    <p className="text-xs text-ink-500">Meta del {goal.period}</p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleEdit(goal.id, goal.target)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar meta"
                  >
                    <Edit2 className="w-4 h-4 text-ink-500" />
                  </button>
                )}
              </div>

              {/* Progreso */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-3xl font-bold text-ink-900">
                      {goal.current}
                    </span>
                    <span className="text-lg text-ink-500 ml-2">/ {goal.target}</span>
                  </div>
                  <span className="text-lg font-semibold text-ink-700">
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(percentage)} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-xs text-ink-500 mt-2">
                  {goal.unit} • {goal.target - goal.current > 0 ? `Faltan ${goal.target - goal.current}` : 'Meta alcanzada'}
                </p>
              </div>

              {/* Editar meta */}
              {isEditing ? (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-ink-600 mb-2">Nueva meta:</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-ink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(goal.id)}
                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-ink-700">
                    {getMotivationalMessage(percentage, goal.title.toLowerCase())}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Proyecciones si está en camino */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Proyección anual */}
        {data.avgBooksPerMonth > 0 && (
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-ink-900">Proyección anual</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              ~{Math.round(data.avgBooksPerMonth * 12)} libros
            </p>
            <p className="text-xs text-ink-500 mt-1">
              A tu ritmo actual de {data.avgBooksPerMonth.toFixed(1)} libros/mes
            </p>
          </div>
        )}

        {/* Meta personalizada sugerida */}
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium text-ink-900">Meta sugerida</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {Math.ceil(data.avgBooksPerMonth * 12 * 1.2)} libros
          </p>
          <p className="text-xs text-ink-500 mt-1">
            20% más de tu proyección actual (desafiante pero alcanzable)
          </p>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-ink-200">
        <p className="text-xs text-ink-500 text-center italic">
          💡 Tip: Las metas son flexibles. Ajústalas según tu tiempo y preferencias. 
          Lo importante es disfrutar de cada lectura.
        </p>
      </div>

      {/* Logros desbloqueados */}
      {(data.booksThisYear >= yearlyBooksGoal || estimatedPagesThisMonth >= monthlyPagesGoal) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
          <p className="text-center font-bold text-amber-800 mb-2">
            🏆 ¡Logros Desbloqueados!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.booksThisYear >= yearlyBooksGoal && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                ⭐ Meta anual alcanzada
              </span>
            )}
            {estimatedPagesThisMonth >= monthlyPagesGoal && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                📖 Meta mensual alcanzada
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}