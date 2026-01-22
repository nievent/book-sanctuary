import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          author: string
          status?: 'to_read' | 'reading' | 'completed'
          rating?: number | null
          pages?: number | null
          current_page?: number | null
          cover_url?: string | null
          notes?: string | null
          favorite?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          author?: string
          status?: 'to_read' | 'reading' | 'completed'
          rating?: number | null
          pages?: number | null
          current_page?: number | null
          cover_url?: string | null
          notes?: string | null
          favorite?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reading_sessions: {
        Row: {
          id: string
          user_id: string
          book_id: string
          pages_read: number
          duration_minutes: number
          session_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          pages_read: number
          duration_minutes: number
          session_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          pages_read?: number
          duration_minutes?: number
          session_date?: string
          created_at?: string
        }
      }
    }
  }
}