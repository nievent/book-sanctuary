export type User = {
  id: string
  email: string
  user_metadata: {
    name?: string
  }
}

export type Book = {
  id: string
  user_id: string
  title: string
  author: string
  status: 'to_read' | 'reading' | 'completed'
  rating: number | null
  pages: number | null
  current_page: number | null
  cover_url: string | null
  notes: string | null
  favorite: boolean
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type BookStats = {
  total: number
  reading: number
  completed: number
  toRead: number
  favorites: number
  totalPages: number
  pagesRead: number
} 