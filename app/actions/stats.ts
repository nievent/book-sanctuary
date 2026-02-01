"use server"

import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, subMonths, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export async function getDetailedStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)

  if (!books) return null

  const now = new Date()
  const sixMonthsAgo = subMonths(now, 6)

  // Estadísticas generales
  const total = books.length
  const reading = books.filter(b => b.status === 'reading').length
  const completed = books.filter(b => b.status === 'completed').length
  const toRead = books.filter(b => b.status === 'to_read').length
  
  const completedBooks = books.filter(b => b.status === 'completed')
  const totalPagesRead = completedBooks.reduce((sum, b) => sum + (b.pages || 0), 0)
  
  // Calcular páginas leídas en libros en progreso
  const pagesInProgress = books
    .filter(b => b.status === 'reading')
    .reduce((sum, b) => sum + (b.current_page || 0), 0)

  // Promedio de páginas por libro
  const avgPagesPerBook = completedBooks.length > 0
    ? Math.round(totalPagesRead / completedBooks.length)
    : 0

  // Rating promedio
  const booksWithRating = books.filter(b => b.rating !== null)
  const avgRating = booksWithRating.length > 0
    ? booksWithRating.reduce((sum, b) => sum + (b.rating || 0), 0) / booksWithRating.length
    : 0

  // Libros completados en los últimos 6 meses
  const recentCompletions = completedBooks.filter(b => {
    if (!b.completed_at) return false
    const completedDate = parseISO(b.completed_at)
    return completedDate >= sixMonthsAgo && completedDate <= now
  })

  // Libros completados EN EL MES ACTUAL (no últimos 6 meses)
  const startOfCurrentMonth = startOfMonth(now)
  const endOfCurrentMonth = endOfMonth(now)
  const completedThisMonth = completedBooks.filter(b => {
    if (!b.completed_at) return false
    const completedDate = parseISO(b.completed_at)
    return completedDate >= startOfCurrentMonth && completedDate <= endOfCurrentMonth
  }).length

  // Datos mensuales (últimos 6 meses)
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })
  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const booksCompletedThisMonth = completedBooks.filter(b => {
      if (!b.completed_at) return false
      const completedDate = parseISO(b.completed_at)
      return completedDate >= monthStart && completedDate <= monthEnd
    })

    // Calcular páginas leídas considerando distribución temporal
    let pagesReadThisMonth = 0
    
    completedBooks.forEach(b => {
      if (!b.completed_at || !b.pages) return
      
      const completedDate = parseISO(b.completed_at)
      
      // Si el libro fue completado en este mes
      if (completedDate >= monthStart && completedDate <= monthEnd) {
        // Si tiene fecha de inicio, distribuir proporcionalmente
        if (b.started_at) {
          const startedDate = parseISO(b.started_at)
          
          // Calcular días totales de lectura
          const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (totalDays > 0) {
            // Calcular qué días del mes se leyó
            const readingStartInMonth = startedDate < monthStart ? monthStart : startedDate
            const readingEndInMonth = completedDate > monthEnd ? monthEnd : completedDate
            
            const daysInThisMonth = Math.ceil((readingEndInMonth.getTime() - readingStartInMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1
            
            // Páginas por día
            const pagesPerDay = b.pages / totalDays
            
            // Páginas en este mes
            pagesReadThisMonth += Math.round(pagesPerDay * daysInThisMonth)
          } else {
            // Si empezó y terminó el mismo día, contar todas las páginas
            pagesReadThisMonth += b.pages
          }
        } else {
          // Sin fecha de inicio, contar todas las páginas en el mes de finalización
          pagesReadThisMonth += b.pages
        }
      }
      // Si el libro se empezó en este mes pero se terminó después
      else if (b.started_at) {
        const startedDate = parseISO(b.started_at)
        
        if (startedDate >= monthStart && startedDate <= monthEnd && completedDate > monthEnd) {
          // Calcular días totales de lectura
          const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (totalDays > 0) {
            // Calcular días en este mes (desde inicio hasta fin de mes)
            const daysInThisMonth = Math.ceil((monthEnd.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            
            // Páginas por día
            const pagesPerDay = b.pages / totalDays
            
            // Páginas en este mes
            pagesReadThisMonth += Math.round(pagesPerDay * daysInThisMonth)
          }
        }
        // Si el libro se estaba leyendo durante este mes (empezó antes y terminó después)
        else if (startedDate < monthStart && completedDate > monthEnd) {
          const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (totalDays > 0) {
            // Todo el mes leyendo
            const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
            
            // Páginas por día
            const pagesPerDay = b.pages / totalDays
            
            // Páginas en este mes
            pagesReadThisMonth += Math.round(pagesPerDay * daysInMonth)
          }
        }
      }
    })

    // Calcular días promedio para completar libros este mes
    const booksWithDatesThisMonth = booksCompletedThisMonth.filter(
      b => b.started_at && b.completed_at
    )
    
    const avgDaysThisMonth = booksWithDatesThisMonth.length > 0
      ? Math.round(
          booksWithDatesThisMonth.reduce((sum, b) => {
            const start = parseISO(b.started_at!)
            const end = parseISO(b.completed_at!)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            return sum + days
          }, 0) / booksWithDatesThisMonth.length
        )
      : null

    return {
      month: format(month, 'MMM yyyy', { locale: es }),
      monthShort: format(month, 'MMM', { locale: es }),
      booksCompleted: booksCompletedThisMonth.length,
      pagesRead: pagesReadThisMonth,
      avgDays: avgDaysThisMonth,
    }
  })

  // Distribución de ratings
  const ratingDistribution = [
    { range: '9-10', count: books.filter(b => b.rating && b.rating >= 9).length },
    { range: '7-8', count: books.filter(b => b.rating && b.rating >= 7 && b.rating < 9).length },
    { range: '5-6', count: books.filter(b => b.rating && b.rating >= 5 && b.rating < 7).length },
    { range: '3-4', count: books.filter(b => b.rating && b.rating >= 3 && b.rating < 5).length },
    { range: '0-2', count: books.filter(b => b.rating && b.rating < 3).length },
  ]

  // Distribución por estado
  const statusDistribution = [
    { name: 'Completados', value: completed, color: '#6b7280' },
    { name: 'Leyendo', value: reading, color: '#7d8f7d' },
    { name: 'Por leer', value: toRead, color: '#d4c4a8' },
  ]

  // Velocidad de lectura (páginas por libro completado en los últimos 30 días)
  const thirtyDaysAgo = subMonths(now, 1)
  const recentBooks = completedBooks.filter(b => {
    if (!b.completed_at || !b.started_at) return false
    const completedDate = parseISO(b.completed_at)
    return completedDate >= thirtyDaysAgo
  })

  const readingSpeed = recentBooks.length > 0
    ? Math.round(recentBooks.reduce((sum, b) => sum + (b.pages || 0), 0) / recentBooks.length)
    : 0

  // Tiempo promedio de lectura (días)
  const booksWithDates = completedBooks.filter(b => b.started_at && b.completed_at)
  const avgReadingDays = booksWithDates.length > 0
    ? Math.round(
        booksWithDates.reduce((sum, b) => {
          const start = parseISO(b.started_at!)
          const end = parseISO(b.completed_at!)
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / booksWithDates.length
      )
    : 0

  // Ranking de autores por cantidad de libros
  const authorBookCount = new Map<string, number>()
  completedBooks.forEach(book => {
    const count = authorBookCount.get(book.author) || 0
    authorBookCount.set(book.author, count + 1)
  })

  const topAuthorsByCount = Array.from(authorBookCount.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Ranking de autores por valoración promedio (mínimo 1 libro)
  const authorRatings = new Map<string, { total: number; count: number }>()
  books.forEach(book => {
    if (book.rating !== null) {
      const current = authorRatings.get(book.author) || { total: 0, count: 0 }
      authorRatings.set(book.author, {
        total: current.total + book.rating,
        count: current.count + 1
      })
    }
  })

  const topAuthorsByRating = Array.from(authorRatings.entries())
    .map(([author, data]) => ({
      author,
      avgRating: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5)

  // ============== PREDICCIONES ==============
  
  // Libros completados este año
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const booksThisYear = completedBooks.filter(b => {
    if (!b.completed_at) return false
    const completedDate = parseISO(b.completed_at)
    return completedDate >= startOfYear && completedDate <= now
  }).length

  // ============== NUBE DE PALABRAS ==============
  
  // Palabras a ignorar (stop words en español)
  const stopWords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'una', 'los', 'las',
    'del', 'al', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'hasta',
    'desde', 'durante', 'mediante', 'contra', 'según', 'bajo', 'tras',
    'es', 'son', 'era', 'fue', 'ha', 'han', 'he', 'ser', 'estar', 'tener',
    'hacer', 'haber', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'si', 'no',
    'o', 'e', 'i', 'u', 'pero', 'como', 'mas', 'más', 'ni', 'muy', 'ya',
    'the', 'of', 'and', 'to', 'in', 'a', 'is', 'it', 'you', 'that', 'for',
    'on', 'with', 'as', 'was', 'at', 'be', 'this', 'have', 'from', 'or',
  ])

  // Procesar todos los títulos
  const wordCount = new Map<string, number>()
  
  books.forEach(book => {
    // Limpiar y dividir el título en palabras
    const words: string[] = book.title
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()«»""''¿?¡!]/g, '') // Quitar puntuación
      .split(/\s+/) // Dividir por espacios
      .filter((word: string) => 
        word.length > 2 && // Mínimo 3 caracteres
        !stopWords.has(word) && // No es stop word
        !/^\d+$/.test(word) // No es solo números
      )

    words.forEach((word: string) => {
      const count = wordCount.get(word) || 0
      wordCount.set(word, count + 1)
    })
  })

  // Convertir a array y ordenar por frecuencia
  const wordCloudData = Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50) // Top 50 palabras

  // Promedio de libros por mes (últimos 6 meses)
  const monthsWithBooks = monthlyData.filter(m => m.booksCompleted > 0).length
  const avgBooksPerMonth = monthsWithBooks > 0
    ? monthlyData.reduce((sum, m) => sum + m.booksCompleted, 0) / monthsWithBooks
    : 0

  // Proyección de libros para fin de año
  const monthsLeftInYear = 12 - (now.getMonth() + 1)
  const projectedBooksRestOfYear = avgBooksPerMonth * monthsLeftInYear
  const projectedYearEnd = Math.round(booksThisYear + projectedBooksRestOfYear)

  // Páginas este mes (ya tenemos startOfCurrentMonth definido arriba)
  // Distribuir proporcionalmente según días de lectura
  let pagesThisMonth = 0
  
  completedBooks.forEach(b => {
    if (!b.completed_at || !b.pages) return
    
    const completedDate = parseISO(b.completed_at)
    
    // Si el libro fue completado este mes
    if (completedDate >= startOfCurrentMonth && completedDate <= now) {
      if (b.started_at) {
        const startedDate = parseISO(b.started_at)
        const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (totalDays > 0) {
          const readingStartInMonth = startedDate < startOfCurrentMonth ? startOfCurrentMonth : startedDate
          const daysInThisMonth = Math.ceil((completedDate.getTime() - readingStartInMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1
          const pagesPerDay = b.pages / totalDays
          pagesThisMonth += Math.round(pagesPerDay * daysInThisMonth)
        } else {
          pagesThisMonth += b.pages
        }
      } else {
        pagesThisMonth += b.pages
      }
    }
    // Si el libro se está leyendo (empezó este mes o antes, aún no terminado o terminado después)
    else if (b.started_at) {
      const startedDate = parseISO(b.started_at)
      
      // Empezó este mes pero no ha terminado aún o terminó después
      if (startedDate >= startOfCurrentMonth && startedDate <= now) {
        // Si ya terminó (después de este mes)
        if (b.status === 'completed' && completedDate > now) {
          const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
          if (totalDays > 0) {
            const daysInThisMonth = Math.ceil((now.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            const pagesPerDay = b.pages / totalDays
            pagesThisMonth += Math.round(pagesPerDay * daysInThisMonth)
          }
        }
      }
      // Empezó antes de este mes y aún no terminó o terminó después
      else if (startedDate < startOfCurrentMonth) {
        if (b.status === 'completed' && completedDate > endOfCurrentMonth) {
          const totalDays = Math.ceil((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24))
          if (totalDays > 0) {
            const daysInMonth = Math.ceil((endOfCurrentMonth.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1
            const pagesPerDay = b.pages / totalDays
            pagesThisMonth += Math.round(pagesPerDay * daysInMonth)
          }
        }
      }
    }
  })

  // Proyección de páginas para fin de mes
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const projectedPagesThisMonth = dayOfMonth > 0
    ? Math.round((pagesThisMonth / dayOfMonth) * daysInMonth)
    : 0

  // Tiempo estimado para terminar libros "Por leer"
  const toReadCount = books.filter(b => b.status === 'to_read').length
  let daysToFinishToRead: number | null = null
  let monthsToFinishToRead: number | null = null

  if (toReadCount > 0 && avgReadingDays > 0 && avgBooksPerMonth > 0) {
    // Calcular cuántos meses tardaría en leer todos los libros "por leer"
    monthsToFinishToRead = Math.ceil(toReadCount / avgBooksPerMonth)
    daysToFinishToRead = Math.round(toReadCount * avgReadingDays)
  }

  // ============== DATOS PARA OBJETIVOS ==============
  
  // Páginas leídas este año
  const pagesThisYear = completedBooks
    .filter(b => {
      if (!b.completed_at) return false
      const completedDate = parseISO(b.completed_at)
      return completedDate >= startOfYear && completedDate <= now
    })
    .reduce((sum, b) => sum + (b.pages || 0), 0)

  // ============== MEJORES LIBROS ==============
  
  // Generar datos para los últimos 6 meses
  const monthlyBestBooks = months.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const booksThisMonth = completedBooks.filter(b => {
      if (!b.completed_at || b.rating === null) return false
      const completedDate = parseISO(b.completed_at)
      return completedDate >= monthStart && completedDate <= monthEnd
    })
    
    const bestBook = booksThisMonth.length > 0
      ? booksThisMonth.reduce((best, current) => 
          (current.rating || 0) > (best.rating || 0) ? current : best
        )
      : null

    return {
      month: format(month, 'MMMM', { locale: es }),
      year: month.getFullYear(),
      book: bestBook ? {
        id: bestBook.id,
        title: bestBook.title,
        author: bestBook.author,
        rating: bestBook.rating!,
        pages: bestBook.pages,
        cover_url: bestBook.cover_url,
        completed_at: bestBook.completed_at!,
        notes: bestBook.notes,
      } : null
    }
  }).reverse() // Invertir para que el más reciente sea primero

  // Libro del año (mejor valorado completado este año)
  const booksThisYearWithRating = completedBooks.filter(b => {
    if (!b.completed_at || b.rating === null) return false
    const completedDate = parseISO(b.completed_at)
    return completedDate >= startOfYear && completedDate <= now
  })
  
  const bookOfYear = booksThisYearWithRating.length > 0
    ? booksThisYearWithRating.reduce((best, current) => 
        (current.rating || 0) > (best.rating || 0) ? current : best
      )
    : null

  // Mejor libro de todos los tiempos
  const allRatedBooks = books.filter(b => b.rating !== null && b.status === 'completed')
  const topRatedAllTime = allRatedBooks.length > 0
    ? allRatedBooks.reduce((best, current) => 
        (current.rating || 0) > (best.rating || 0) ? current : best
      )
    : null

  return {
    general: {
      total,
      reading,
      completed,
      toRead,
      totalPagesRead,
      pagesInProgress,
      avgPagesPerBook,
      avgRating,
      avgReadingDays,
      completedThisMonth,
    },
    monthlyData,
    ratingDistribution,
    statusDistribution,
    authorRanking: {
      topByCount: topAuthorsByCount,
      topByRating: topAuthorsByRating,
    },
    predictions: {
      booksThisYear,
      projectedYearEnd,
      daysToFinishToRead,
      monthsToFinishToRead,
      currentStreak: 0, // placeholder, no usamos racha
      pagesThisMonth,
      projectedPagesThisMonth,
      avgBooksPerMonth,
      toReadCount,
    },
    wordCloud: wordCloudData,
    goals: {
      booksThisYear,
      pagesThisYear,
      avgBooksPerMonth,
      totalBooks: total,
      totalPagesRead,
    },
    bestBooks: {
      monthlyBooks: monthlyBestBooks,
      bookOfYear: bookOfYear ? {
        id: bookOfYear.id,
        title: bookOfYear.title,
        author: bookOfYear.author,
        rating: bookOfYear.rating!,
        pages: bookOfYear.pages,
        cover_url: bookOfYear.cover_url,
        completed_at: bookOfYear.completed_at!,
        notes: bookOfYear.notes,
      } : null,
      topRatedAllTime: topRatedAllTime ? {
        id: topRatedAllTime.id,
        title: topRatedAllTime.title,
        author: topRatedAllTime.author,
        rating: topRatedAllTime.rating!,
        pages: topRatedAllTime.pages,
        cover_url: topRatedAllTime.cover_url,
        completed_at: topRatedAllTime.completed_at!,
        notes: topRatedAllTime.notes,
      } : null,
      currentMonth: format(now, 'MMMM', { locale: es }),
      currentYear: now.getFullYear(),
    },
    recentBooks: completedBooks
      .filter(b => b.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        rating: b.rating,
        pages: b.pages,
        completed_at: b.completed_at,
      })),
  }
}