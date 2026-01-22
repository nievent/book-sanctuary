"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getBooks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching books:', error)
    return []
  }

  return data
}

export async function createBook(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }

  const ratingValue = formData.get('rating') as string
  const rating = ratingValue && ratingValue !== '' ? parseFloat(ratingValue) : null

  const bookData = {
    user_id: user.id,
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    status: (formData.get('status') as string) || 'to_read',
    pages: formData.get('pages') ? parseInt(formData.get('pages') as string) : null,
    cover_url: formData.get('cover_url') as string || null,
    notes: formData.get('notes') as string || null,
    rating: rating,
  }

  const { error } = await supabase.from('books').insert(bookData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }

  const ratingValue = formData.get('rating') as string
  const rating = ratingValue && ratingValue !== '' ? parseFloat(ratingValue) : null

  const updateData: {
    title: string
    author: string
    status: string
    pages: number | null
    current_page: number | null
    rating: number | null
    notes: string | null
    favorite: boolean
    started_at?: string | null
    completed_at?: string | null
  } = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    status: formData.get('status') as string,
    pages: formData.get('pages') ? parseInt(formData.get('pages') as string) : null,
    current_page: formData.get('current_page') ? parseInt(formData.get('current_page') as string) : null,
    rating: rating,
    notes: formData.get('notes') as string || null,
    favorite: formData.get('favorite') === 'true',
  }

  // Actualizar fechas si se proporcionan
  const startedAtValue = formData.get('started_at') as string
  const completedAtValue = formData.get('completed_at') as string
  
  if (startedAtValue) {
    updateData.started_at = startedAtValue
  }
  if (completedAtValue) {
    updateData.completed_at = completedAtValue
  }

  const { error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteBook(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleFavorite(id: string, favorite: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('books')
    .update({ favorite })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProgress(id: string, currentPage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('books')
    .update({ current_page: currentPage })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getBookStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)

  if (!books) return null

  const total = books.length
  const reading = books.filter(b => b.status === 'reading').length
  const completed = books.filter(b => b.status === 'completed').length
  const toRead = books.filter(b => b.status === 'to_read').length
  const favorites = books.filter(b => b.favorite).length
  
  const totalPages = books.reduce((sum, b) => sum + (b.pages || 0), 0)
  const pagesRead = books
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.pages || 0), 0)

  return {
    total,
    reading,
    completed,
    toRead,
    favorites,
    totalPages,
    pagesRead,
  }
}