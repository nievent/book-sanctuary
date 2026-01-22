"use client"

import { BookCard } from "@/components/books/BookCard"

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
}

export function BookGrid({ books }: { books: Book[] }) {
  // Filtrar solo libros que se están leyendo
  const readingBooks = books.filter(b => b.status === 'reading')
  
  // Mostrar todos los libros si no hay ninguno leyendo
  const displayBooks = readingBooks.length > 0 ? readingBooks : books

  return (
    <div className="books-grid">
      {displayBooks.map((book, i) => (
        <div 
          key={book.id}
          className="animate-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
  )
}