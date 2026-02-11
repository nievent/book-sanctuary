// Ruta: app/actions/achievements.ts

"use server"

import { createClient } from "@/lib/supabase/server"
import { ACHIEVEMENTS, calculateAchievements } from "@/lib/achievements"
import { getBooks } from "./books"

/**
 * Obtener todos los achievements del usuario con su estado
 */
export async function getUserAchievements() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Obtener libros del usuario
  const books = await getBooks()
  
  // Calcular achievements desbloqueados y en progreso
  const achievementsData = calculateAchievements(books)
  
  // Obtener achievements guardados en DB
  const { data: savedAchievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id)
  
  const savedIds = new Set(savedAchievements?.map(a => a.achievement_id) || [])
  
  // Combinar datos
  const unlockedWithDates = achievementsData.unlocked.map(achievement => {
    const saved = savedAchievements?.find(s => s.achievement_id === achievement.id)
    return {
      ...achievement,
      unlocked_at: saved?.unlocked_at || new Date().toISOString(),
      is_new: !savedIds.has(achievement.id), // Si no está guardado, es nuevo
    }
  })
  
  return {
    unlocked: unlockedWithDates,
    inProgress: achievementsData.inProgress,
    locked: achievementsData.locked,
    stats: {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedWithDates.length,
      percentage: Math.round((unlockedWithDates.length / ACHIEVEMENTS.length) * 100),
    }
  }
}

/**
 * Guardar achievement desbloqueado en la base de datos
 */
export async function saveUnlockedAchievement(achievementId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autenticado' }

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single()
  
  if (existing) {
    return { success: true, alreadyExists: true }
  }

  // Insertar nuevo achievement
  const { error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: user.id,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true, alreadyExists: false }
}

/**
 * Verificar y guardar nuevos achievements desbloqueados
 * Esta función se puede llamar después de completar un libro, valorar, etc.
 */
export async function checkAndSaveNewAchievements() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { newAchievements: [] }

  const achievementsData = await getUserAchievements()
  if (!achievementsData) return { newAchievements: [] }

  const newAchievements = []

  // Guardar achievements nuevos
  for (const achievement of achievementsData.unlocked) {
    if (achievement.is_new) {
      const result = await saveUnlockedAchievement(achievement.id)
      if (result.success && !result.alreadyExists) {
        newAchievements.push(achievement)
      }
    }
  }

  return { newAchievements }
}

/**
 * Obtener estadísticas de achievements por categoría
 */
export async function getAchievementsByCategory() {
  const achievementsData = await getUserAchievements()
  if (!achievementsData) return null

  const categories: Record<string, any> = {
    reading: { unlocked: [], inProgress: [], locked: [] },
    speed: { unlocked: [], inProgress: [], locked: [] },
    diversity: { unlocked: [], inProgress: [], locked: [] },
    consistency: { unlocked: [], inProgress: [], locked: [] },
    quality: { unlocked: [], inProgress: [], locked: [] },
  }

  // Clasificar unlocked
  achievementsData.unlocked.forEach(ach => {
    if (categories[ach.category]) {
      categories[ach.category].unlocked.push(ach)
    }
  })

  // Clasificar inProgress
  achievementsData.inProgress.forEach(ach => {
    if (categories[ach.category]) {
      categories[ach.category].inProgress.push(ach)
    }
  })

  // Clasificar locked
  achievementsData.locked.forEach(ach => {
    if (categories[ach.category]) {
      categories[ach.category].locked.push(ach)
    }
  })

  return {
    categories,
    stats: achievementsData.stats,
  }
}