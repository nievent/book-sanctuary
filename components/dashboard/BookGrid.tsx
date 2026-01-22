"use client"

import { BookCard } from "@/components/books/BookCard"
import { FilterBar } from "@/components/books/FilterBar"
import { useState, useMemo } from "react"

type Book = {
  id: string
  title: string
  author: string
  status: string
  cover_url: string | null
  rating: number | null
  pages: number | null
  current_page: number | null
  favorite: boolean
  notes?: string | null
  started_at?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

type BookStats = {
  total: number
  reading: number
  completed: number
  toRead: number
}

export function BookGrid({ books, stats }: { books: Book[], stats: BookStats | null }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('date_desc')

  // Filtrar libros
  const filteredBooks = useMemo(() => {
    if (filter === 'all') return books
    return books.filter(book => book.status === filter)
  }, [books, filter])

  // Ordenar libros
  const sortedBooks = useMemo(() => {
    const booksCopy = [...filteredBooks]

    switch (sort) {
      case 'date_desc':
        return booksCopy.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      case 'date_asc':
        return booksCopy.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      case 'rating_desc':
        return booksCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'rating_asc':
        return booksCopy.sort((a, b) => (a.rating || 0) - (b.rating || 0))
      case 'title_asc':
        return booksCopy.sort((a, b) => a.title.localeCompare(b.title))
      case 'title_desc':
        return booksCopy.sort((a, b) => b.title.localeCompare(a.title))
      case 'completed_desc':
        return booksCopy.sort((a, b) => {
          if (!a.completed_at) return 1
          if (!b.completed_at) return -1
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        })
      default:
        return booksCopy
    }
  }, [filteredBooks, sort])

  return (
    <div className="space-y-8">
      {/* Barra de filtros */}
      <FilterBar
        onFilterChange={setFilter}
        onSortChange={setSort}
        currentFilter={filter}
        currentSort={sort}
        stats={stats}
      />

      {/* Grid de libros */}
      {sortedBooks.length > 0 ? (
        <div className="books-grid">
          {sortedBooks.map((book, i) => (
            <div 
              key={book.id}
              className="animate-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-heading-3 font-serif text-ink-900 mb-3">
              No hay libros {filter !== 'all' ? 'en esta categoría' : ''}
            </h3>
            <p className="text-body text-ink-600">
              {filter !== 'all' 
                ? 'Intenta cambiar los filtros para ver más libros'
                : 'Comienza añadiendo tu primer libro'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}