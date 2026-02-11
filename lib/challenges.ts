// Ruta: lib/challenges.ts

/**
 * Sistema de Desafíos de Lectura
 */

import type { Book } from './types'

export type ChallengeType = 
  | 'books_count'    // Leer X libros
  | 'pages_count'    // Leer X páginas
  | 'genre'          // Leer X libros de un género
  | 'author'         // Leer X libros de un autor
  | 'classics'       // Leer X clásicos
  | 'new_authors'    // Leer X autores diferentes
  | 'rating'         // Leer X libros valorados con mínimo Y
  | 'custom'         // Personalizado

export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned'

export type Challenge = {
  id: string
  user_id: string
  title: string
  description: string
  type: ChallengeType
  target_value: number
  current_value: number
  genre_filter?: string | null
  author_filter?: string | null
  min_rating?: number | null
  start_date: string
  end_date: string
  completed_at: string | null
  status: ChallengeStatus
  icon: string
  color: string
  created_at: string
  updated_at: string
}

export type ChallengeTemplate = {
  id: string
  title: string
  description: string
  type: ChallengeType
  target_value: number
  duration_days: number
  icon: string
  color: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'books_12',
    title: '12 Libros en el Año',
    description: 'Lee 12 libros antes de que termine el año',
    type: 'books_count',
    target_value: 12,
    duration_days: 365,
    icon: '📚',
    color: 'from-blue-500 to-blue-700',
    difficulty: 'easy',
  },
  {
    id: 'books_24',
    title: '2 Libros por Mes',
    description: 'Lee 24 libros en 12 meses',
    type: 'books_count',
    target_value: 24,
    duration_days: 365,
    icon: '📖',
    color: 'from-purple-500 to-purple-700',
    difficulty: 'medium',
  },
  {
    id: 'pages_5000',
    title: '5,000 Páginas',
    description: 'Lee 5,000 páginas en 6 meses',
    type: 'pages_count',
    target_value: 5000,
    duration_days: 180,
    icon: '📄',
    color: 'from-emerald-500 to-teal-600',
    difficulty: 'easy',
  },
  {
    id: 'classics_12',
    title: 'Año de Clásicos',
    description: 'Lee 12 clásicos de la literatura',
    type: 'classics',
    target_value: 12,
    duration_days: 365,
    icon: '📕',
    color: 'from-rose-500 to-red-600',
    difficulty: 'medium',
  },
]

export function calculateChallengeProgress(challenge: Challenge, allBooks: Book[]): number {
  const startDate = new Date(challenge.start_date)
  const endDate = new Date(challenge.end_date)
  
  const relevantBooks = allBooks.filter(book => {
    if (book.status !== 'completed' || !book.completed_at) return false
    const completedDate = new Date(book.completed_at)
    return completedDate >= startDate && completedDate <= endDate
  })
  
  let currentValue = 0
  
  switch (challenge.type) {
    case 'books_count':
      currentValue = relevantBooks.length
      break
    case 'pages_count':
      currentValue = relevantBooks.reduce((sum, book) => sum + (book.pages || 0), 0)
      break
    case 'genre':
      currentValue = relevantBooks.filter(book => 
        book.notes?.toLowerCase().includes(challenge.genre_filter?.toLowerCase() || '')
      ).length
      break
    case 'author':
      currentValue = relevantBooks.filter(book =>
        book.author.toLowerCase().includes(challenge.author_filter?.toLowerCase() || '')
      ).length
      break
    case 'classics':
      currentValue = relevantBooks.filter(book =>
        book.notes?.toLowerCase().includes('clásico') ||
        book.notes?.toLowerCase().includes('classic')
      ).length
      break
    case 'new_authors':
      const uniqueAuthors = new Set(relevantBooks.map(book => book.author))
      currentValue = uniqueAuthors.size
      break
    case 'rating':
      currentValue = relevantBooks.filter(book =>
        book.rating !== null && book.rating >= (challenge.min_rating || 7)
      ).length
      break
    case 'custom':
      currentValue = relevantBooks.length
      break
  }
  
  return currentValue
}

export function getChallengePercentage(challenge: Challenge): number {
  return Math.min(100, Math.round((challenge.current_value / challenge.target_value) * 100))
}

export function getDaysRemaining(challenge: Challenge): number {
  const now = new Date()
  const endDate = new Date(challenge.end_date)
  const diffTime = endDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

export function getChallengeTypeIcon(type: ChallengeType): string {
  const icons: Record<ChallengeType, string> = {
    books_count: '📚',
    pages_count: '📄',
    genre: '🎭',
    author: '✍️',
    classics: '📕',
    new_authors: '🌟',
    rating: '⭐',
    custom: '🎯',
  }
  return icons[type]
}

export function getChallengeTypeColor(type: ChallengeType): string {
  const colors: Record<ChallengeType, string> = {
    books_count: 'from-blue-500 to-blue-700',
    pages_count: 'from-emerald-500 to-teal-600',
    genre: 'from-purple-500 to-pink-600',
    author: 'from-amber-500 to-orange-600',
    classics: 'from-rose-500 to-red-600',
    new_authors: 'from-cyan-500 to-blue-600',
    rating: 'from-yellow-500 to-amber-600',
    custom: 'from-gray-500 to-gray-700',
  }
  return colors[type]
}