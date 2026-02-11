// Ruta: app/actions/challenges.ts

"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getBooks } from "./books"
import { Challenge, calculateChallengeProgress } from "@/lib/challenges"

export async function getChallenges() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }

  return data as Challenge[]
}

export async function createChallenge(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const challengeData = {
    user_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as string,
    target_value: parseInt(formData.get('target_value') as string),
    current_value: 0,
    genre_filter: formData.get('genre_filter') as string || null,
    author_filter: formData.get('author_filter') as string || null,
    min_rating: formData.get('min_rating') ? parseInt(formData.get('min_rating') as string) : null,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    status: 'active' as const,
    icon: formData.get('icon') as string || '🎯',
    color: formData.get('color') as string || 'from-blue-500 to-blue-700',
  }

  const { error } = await supabase.from('challenges').insert(challengeData)

  if (error) return { error: error.message }

  revalidatePath('/challenges')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateChallenge(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const updateData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    target_value: parseInt(formData.get('target_value') as string),
  }

  const { error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/challenges')
  return { success: true }
}

export async function deleteChallenge(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/challenges')
  return { success: true }
}

export async function updateChallengeStatus(id: string, status: Challenge['status']) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const updateData: { status: Challenge['status']; completed_at?: string } = { status }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/challenges')
  return { success: true }
}

export async function updateAllChallengesProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  const [challenges, books] = await Promise.all([
    getChallenges(),
    getBooks(),
  ])

  for (const challenge of challenges) {
    if (challenge.status !== 'active') continue

    const newValue = calculateChallengeProgress(challenge, books)
    const isCompleted = newValue >= challenge.target_value

    const updateData: {
      current_value: number
      status?: Challenge['status']
      completed_at?: string
    } = { current_value: newValue }

    if (isCompleted && challenge.status === 'active') {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    }

    await supabase
      .from('challenges')
      .update(updateData)
      .eq('id', challenge.id)
  }

  revalidatePath('/challenges')
  revalidatePath('/dashboard')
  return { success: true }
}