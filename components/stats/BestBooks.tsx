"use client"

import { Star, Calendar, BookOpen, Award, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

type BookOfPeriod = {
  id: string
  title: string
  author: string
  rating: number
  pages: number | null
  cover_url: string | null
  completed_at: string
  notes: string | null
}

type MonthlyBook = {
  month: string
  year: number
  book: BookOfPeriod | null
}

type BestBooksData = {
  monthlyBooks: MonthlyBook[]
  bookOfYear: BookOfPeriod | null
  topRatedAllTime: BookOfPeriod | null
  currentMonth: string
  currentYear: number
}

export function BestBooks({ data }: { data: BestBooksData }) {
  const [selectedBook, setSelectedBook] = useState<'month' | 'year' | 'alltime'>('month')
  const [monthIndex, setMonthIndex] = useState(0) // 0 = mes actual, 1 = mes anterior, etc.

  const currentMonthData = data.monthlyBooks[monthIndex]

  const getSelectedBookData = () => {
    switch (selectedBook) {
      case 'month':
        return { 
          book: currentMonthData?.book || null, 
          title: `Libro del Mes - ${currentMonthData?.month || data.currentMonth}`, 
          icon: Calendar, 
          color: 'from-blue-500 to-blue-700' 
        }
      case 'year':
        return { 
          book: data.bookOfYear, 
          title: `Libro del Año ${data.currentYear}`, 
          icon: Award, 
          color: 'from-amber-500 to-amber-700' 
        }
      case 'alltime':
        return { 
          book: data.topRatedAllTime, 
          title: 'Mejor Valorado de Todos', 
          icon: TrendingUp, 
          color: 'from-purple-500 to-purple-700' 
        }
    }
  }

  const selected = getSelectedBookData()
  const SelectedIcon = selected.icon

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }

  const canGoPrevious = monthIndex < data.monthlyBooks.length - 1
  const canGoNext = monthIndex > 0

  const handlePreviousMonth = () => {
    if (canGoPrevious) {
      setMonthIndex(monthIndex + 1)
    }
  }

  const handleNextMonth = () => {
    if (canGoNext) {
      setMonthIndex(monthIndex - 1)
    }
  }

  return (
    <div className="card bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-amber-600" />
        <h3 className="text-heading-3 font-serif text-ink-900">
          👑 Mejores Lecturas
        </h3>
      </div>

      {/* Selector de período */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedBook('month')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            selectedBook === 'month'
              ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg'
              : 'bg-white text-ink-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Por Mes
          </div>
        </button>

        <button
          onClick={() => setSelectedBook('year')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            selectedBook === 'year'
              ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg'
              : 'bg-white text-ink-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Este Año
          </div>
        </button>

        <button
          onClick={() => setSelectedBook('alltime')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            selectedBook === 'alltime'
              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
              : 'bg-white text-ink-700 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Mejor Valorado
          </div>
        </button>
      </div>

      {/* Navegación de meses (solo visible cuando está en modo "month") */}
      {selectedBook === 'month' && data.monthlyBooks.length > 0 && (
        <div className="flex items-center justify-between mb-6 p-3 bg-blue-100 rounded-lg border border-blue-300">
          <button
            onClick={handlePreviousMonth}
            disabled={!canGoPrevious}
            className={`p-2 rounded-lg transition-colors ${
              canGoPrevious 
                ? 'hover:bg-blue-200 text-blue-700' 
                : 'text-blue-300 cursor-not-allowed'
            }`}
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-sm font-medium text-blue-900">
              {currentMonthData?.month || data.currentMonth}
            </p>
            <p className="text-xs text-blue-600">
              {currentMonthData?.year || data.currentYear}
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors ${
              canGoNext 
                ? 'hover:bg-blue-200 text-blue-700' 
                : 'text-blue-300 cursor-not-allowed'
            }`}
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Libro destacado */}
      {selected.book ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-amber-300 shadow-elevated">
          <div className="grid md:grid-cols-3 gap-6 p-6">
            {/* Portada */}
            <div className="md:col-span-1">
              <div className="relative group">
                <div className="aspect-book bg-gradient-to-br from-cream-200 to-cream-300 rounded-xl overflow-hidden shadow-lg">
                  {selected.book.cover_url ? (
                    <img 
                      src={selected.book.cover_url} 
                      alt={selected.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <p className="font-serif text-center text-ink-700 text-lg">
                        {selected.book.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Badge de distinción */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center shadow-xl border-4 border-white animate-pulse`}>
                    <SelectedIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                {/* Título del período */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`px-3 py-1 bg-gradient-to-r ${selected.color} text-white text-xs font-bold rounded-full`}>
                    {selected.title}
                  </div>
                </div>

                {/* Título y autor */}
                <h4 className="text-heading-2 font-serif text-ink-900 mb-2 leading-tight">
                  {selected.book.title}
                </h4>
                <p className="text-body-lg text-ink-600 mb-4">
                  por {selected.book.author}
                </p>

                {/* Rating destacado */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-6 h-6 ${
                          i < selected.book!.rating / 2
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-ink-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-amber-600">
                    {selected.book.rating.toFixed(1)}
                  </span>
                  <span className="text-ink-500">/ 10</span>
                </div>

                {/* Detalles */}
                <div className="flex flex-wrap gap-4 text-sm text-ink-600 mb-4">
                  {selected.book.pages && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {selected.book.pages} páginas
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Completado el {formatDate(selected.book.completed_at)}
                  </div>
                </div>

                {/* Notas si existen */}
                {selected.book.notes && (
                  <div className="mt-4 p-4 bg-cream-50 rounded-lg border border-cream-200">
                    <p className="text-sm font-medium text-ink-700 mb-2">
                      💭 Tus notas:
                    </p>
                    <p className="text-sm text-ink-600 leading-relaxed italic">
                      "{selected.book.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Mensaje especial */}
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-300">
                <p className="text-sm text-amber-900 font-medium text-center">
                  {selectedBook === 'month' && "🌟 Tu lectura destacada del mes"}
                  {selectedBook === 'year' && "🏆 La mejor lectura del año hasta ahora"}
                  {selectedBook === 'alltime' && "👑 Tu obra maestra personal"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border-2 border-dashed border-amber-300 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Award className="w-10 h-10 text-amber-600" />
          </div>
          <h4 className="text-xl font-serif text-ink-900 mb-2">
            {selectedBook === 'month' && `No hay libros completados en ${currentMonthData?.month || data.currentMonth}`}
            {selectedBook === 'year' && `Aún no has completado libros en ${data.currentYear}`}
            {selectedBook === 'alltime' && 'Aún no tienes libros valorados'}
          </h4>
          <p className="text-ink-600">
            {selectedBook === 'month' && 'Completa y valora un libro este mes para verlo aquí destacado.'}
            {selectedBook === 'year' && 'Completa y valora un libro este año para verlo aquí destacado.'}
            {selectedBook === 'alltime' && 'Valora tus libros completados para ver cuál es tu favorito.'}
          </p>
        </div>
      )}

      {/* Resumen de todos los períodos */}
      {(currentMonthData?.book || data.bookOfYear || data.topRatedAllTime) && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div 
            className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
              selectedBook === 'month' 
                ? 'bg-blue-100 border-blue-400' 
                : 'bg-white border-blue-200 hover:border-blue-400'
            }`}
            onClick={() => setSelectedBook('month')}
          >
            <p className="text-xs text-ink-600 mb-1">Este mes</p>
            {currentMonthData?.book ? (
              <>
                <p className="text-2xl font-bold text-blue-700">
                  {currentMonthData.book.rating.toFixed(1)}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {currentMonthData.book.title}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400">—</p>
            )}
          </div>

          <div 
            className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
              selectedBook === 'year' 
                ? 'bg-amber-100 border-amber-400' 
                : 'bg-white border-amber-200 hover:border-amber-400'
            }`}
            onClick={() => setSelectedBook('year')}
          >
            <p className="text-xs text-ink-600 mb-1">Este año</p>
            {data.bookOfYear ? (
              <>
                <p className="text-2xl font-bold text-amber-700">
                  {data.bookOfYear.rating.toFixed(1)}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {data.bookOfYear.title}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400">—</p>
            )}
          </div>

          <div 
            className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
              selectedBook === 'alltime' 
                ? 'bg-purple-100 border-purple-400' 
                : 'bg-white border-purple-200 hover:border-purple-400'
            }`}
            onClick={() => setSelectedBook('alltime')}
          >
            <p className="text-xs text-ink-600 mb-1">Mejor valorado</p>
            {data.topRatedAllTime ? (
              <>
                <p className="text-2xl font-bold text-purple-700">
                  {data.topRatedAllTime.rating.toFixed(1)}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {data.topRatedAllTime.title}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400">—</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}