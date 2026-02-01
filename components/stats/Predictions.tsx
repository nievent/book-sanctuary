"use client"

import { Calendar, BookOpen, Target, TrendingUp, Sparkles } from "lucide-react"

type PredictionsData = {
  booksThisYear: number
  projectedYearEnd: number
  daysToFinishToRead: number | null
  monthsToFinishToRead: number | null
  currentStreak: number
  pagesThisMonth: number
  projectedPagesThisMonth: number
  avgBooksPerMonth: number
  toReadCount: number
}

export function Predictions({ data }: { data: PredictionsData }) {
  const today = new Date()
  const currentMonth = today.toLocaleString('es-ES', { month: 'long' })
  const currentYear = today.getFullYear()
  const daysLeftInYear = Math.ceil(
    (new Date(currentYear, 11, 31).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Determinar si las proyecciones son optimistas o conservadoras
  const yearProgress = ((today.getMonth() + 1) / 12) * 100
  const booksProgress = data.booksThisYear > 0 
    ? (data.booksThisYear / data.projectedYearEnd) * 100 
    : 0

  const isAheadOfPace = booksProgress > yearProgress
  const monthProgress = (today.getDate() / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()) * 100
  const pagesProgress = data.projectedPagesThisMonth > 0
    ? (data.pagesThisMonth / data.projectedPagesThisMonth) * 100
    : 0

  return (
    <div className="card bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-heading-3 font-serif text-ink-900">
              🔮 Predicciones de Lectura
            </h3>
          </div>
          <p className="text-sm text-ink-600 mt-1">
            Proyecciones basadas en tu ritmo actual
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Proyección de libros este año */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-ink-600">Libros en {currentYear}</p>
              <p className="text-2xl font-bold text-purple-700">
                ~{data.projectedYearEnd} libros
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Leídos hasta ahora</span>
              <span className="font-semibold text-ink-900">{data.booksThisYear}</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(booksProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-500">
              <span>Inicio del año</span>
              <span>Proyección: {data.projectedYearEnd}</span>
            </div>
          </div>

          {isAheadOfPace ? (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">
                ¡Vas {Math.round(booksProgress - yearProgress)}% por delante del ritmo necesario! 
                {data.projectedYearEnd >= 20 && " A este paso, será un año increíble."}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Quedan {daysLeftInYear} días. Con tu ritmo actual llegarás a ~{data.projectedYearEnd} libros.
                {data.avgBooksPerMonth > 0 && ` (${data.avgBooksPerMonth.toFixed(1)} libros/mes)`}
              </p>
            </div>
          )}
        </div>

        {/* Páginas este mes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-ink-600">Páginas en {currentMonth}</p>
              <p className="text-2xl font-bold text-orange-700">
                ~{data.projectedPagesThisMonth}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Leídas hasta ahora</span>
              <span className="font-semibold text-ink-900">{data.pagesThisMonth}</span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(pagesProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-500">
              <span>Inicio de {currentMonth}</span>
              <span>Proyección</span>
            </div>
          </div>

          {pagesProgress > monthProgress ? (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">
                ¡Vas por buen camino! Estás {Math.round(pagesProgress - monthProgress)}% por delante de lo esperado este mes.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Aún quedan {Math.ceil((100 - monthProgress) * 30 / 100)} días. 
                {data.projectedPagesThisMonth - data.pagesThisMonth > 0 && 
                  ` Necesitas ~${Math.ceil((data.projectedPagesThisMonth - data.pagesThisMonth) / Math.ceil((100 - monthProgress) * 30 / 100))} págs/día.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Tiempo para terminar "Por leer" */}
        {data.toReadCount > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-pink-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-ink-600">Lista "Por leer"</p>
                <p className="text-2xl font-bold text-pink-700">
                  {data.toReadCount} libros
                </p>
              </div>
            </div>

            {data.monthsToFinishToRead !== null && data.monthsToFinishToRead > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-ink-600 mb-2">Tiempo estimado para terminarlos:</p>
                  <p className="text-3xl font-bold text-pink-700">
                    {data.monthsToFinishToRead < 12 
                      ? `${data.monthsToFinishToRead} ${data.monthsToFinishToRead === 1 ? 'mes' : 'meses'}`
                      : `${Math.round(data.monthsToFinishToRead / 12)} ${Math.round(data.monthsToFinishToRead / 12) === 1 ? 'año' : 'años'}`
                    }
                  </p>
                  {data.daysToFinishToRead && data.daysToFinishToRead < 365 && (
                    <p className="text-xs text-ink-500 mt-1">
                      (~{data.daysToFinishToRead} días)
                    </p>
                  )}
                </div>

                <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-ink-700">
                    {data.monthsToFinishToRead <= 6 && "¡Podrías terminarlos este año! 🎯"}
                    {data.monthsToFinishToRead > 6 && data.monthsToFinishToRead <= 12 && "A buen ritmo, los terminarás en menos de un año. 📚"}
                    {data.monthsToFinishToRead > 12 && data.monthsToFinishToRead <= 24 && "Tienes lecturas para un par de años. ¡Qué bien! 📖"}
                    {data.monthsToFinishToRead > 24 && "Tienes una biblioteca increíble por descubrir. 🏰"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 text-center">
                <p className="text-sm text-ink-600">
                  Completa algunos libros para calcular cuánto tardarás en leer tu lista 📚
                </p>
              </div>
            )}
          </div>
        )}

        {/* Racha / Meta adicional */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-ink-600">Dato curioso</p>
              <p className="text-xl font-bold text-indigo-700">
                Ritmo actual
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-ink-600 mb-1">Promedio mensual</p>
              <p className="text-3xl font-bold text-indigo-700">
                {data.avgBooksPerMonth.toFixed(1)}
              </p>
              <p className="text-sm text-ink-500">libros por mes</p>
            </div>

            <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-ink-700">
                {data.avgBooksPerMonth >= 4 && "¡Eres un lector voraz! 🚀"}
                {data.avgBooksPerMonth >= 2 && data.avgBooksPerMonth < 4 && "Excelente ritmo de lectura constante. 📚"}
                {data.avgBooksPerMonth >= 1 && data.avgBooksPerMonth < 2 && "Un buen hábito de lectura mensual. 📖"}
                {data.avgBooksPerMonth < 1 && data.avgBooksPerMonth > 0 && "Cada libro cuenta. ¡Sigue así! ✨"}
                {data.avgBooksPerMonth === 0 && "Completa libros para ver tu ritmo. 🌱"}
              </p>
            </div>

            {data.projectedYearEnd >= 12 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                <p className="text-sm font-medium text-yellow-800">
                  🎯 ¡Objetivo: 1 libro por mes alcanzado!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-ink-200">
        <p className="text-xs text-ink-500 text-center italic">
          💫 Las predicciones se basan en tu ritmo de lectura de los últimos meses. 
          Pueden variar según cambios en tus hábitos. ¡Disfruta el viaje!
        </p>
      </div>
    </div>
  )
}