import type { Book } from './types'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  category: 'reading' | 'speed' | 'diversity' | 'consistency' | 'quality'
  requirement: number
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
type AchievementStatus = 'unlocked' | 'inProgress' | 'locked'

export type GridAchievement = Achievement & {
  status: AchievementStatus
  progress: number
  current?: number
  unlocked_at?: string
  is_new?: boolean
}


export type UserAchievement = {
  achievement_id: string
  unlocked_at: string
  progress: number // 0-100
}

export const ACHIEVEMENTS: Achievement[] = [
  // READING VOLUME
  {
    id: 'first_book',
    name: 'Primera Página',
    description: 'Completa tu primer libro',
    icon: '📖',
    category: 'reading',
    requirement: 1,
    color: 'from-blue-400 to-blue-600',
    rarity: 'common',
  },
  {
    id: 'bibliophile',
    name: 'Bibliófilo',
    description: 'Completa 10 libros',
    icon: '📚',
    category: 'reading',
    requirement: 10,
    color: 'from-blue-500 to-blue-700',
    rarity: 'common',
  },
  {
    id: 'bookworm',
    name: 'Ratón de Biblioteca',
    description: 'Completa 25 libros',
    icon: '🐛',
    category: 'reading',
    requirement: 25,
    color: 'from-purple-500 to-purple-700',
    rarity: 'rare',
  },
  {
    id: 'master_reader',
    name: 'Maestro Lector',
    description: 'Completa 50 libros',
    icon: '🎓',
    category: 'reading',
    requirement: 50,
    color: 'from-purple-600 to-pink-600',
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: 'Leyenda Literaria',
    description: 'Completa 100 libros',
    icon: '👑',
    category: 'reading',
    requirement: 100,
    color: 'from-amber-500 to-orange-600',
    rarity: 'legendary',
  },

  // SPEED READING
  {
    id: 'speed_demon',
    name: 'Demonio de Velocidad',
    description: 'Completa un libro en menos de 3 días',
    icon: '⚡',
    category: 'speed',
    requirement: 1,
    color: 'from-yellow-400 to-orange-500',
    rarity: 'rare',
  },
  {
    id: 'marathon_reader',
    name: 'Lector Maratoniano',
    description: 'Completa 5 libros en un mes',
    icon: '🏃',
    category: 'speed',
    requirement: 5,
    color: 'from-red-500 to-pink-600',
    rarity: 'epic',
  },
  {
    id: 'monthly_champion',
    name: 'Campeón Mensual',
    description: 'Completa 10 libros en un mes',
    icon: '🔥',
    category: 'speed',
    requirement: 10,
    color: 'from-orange-500 to-red-600',
    rarity: 'legendary',
  },

  // DIVERSITY
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Lee 5 autores diferentes',
    icon: '🧭',
    category: 'diversity',
    requirement: 5,
    color: 'from-teal-500 to-cyan-600',
    rarity: 'common',
  },
  {
    id: 'diverse_mind',
    name: 'Mente Diversa',
    description: 'Lee 10 autores diferentes',
    icon: '🌍',
    category: 'diversity',
    requirement: 10,
    color: 'from-emerald-500 to-teal-600',
    rarity: 'rare',
  },
  {
    id: 'world_reader',
    name: 'Lector Mundial',
    description: 'Lee 25 autores diferentes',
    icon: '🌎',
    category: 'diversity',
    requirement: 25,
    color: 'from-green-500 to-emerald-600',
    rarity: 'epic',
  },

  // CONSISTENCY
  {
    id: 'consistent',
    name: 'Constante',
    description: 'Lee al menos 1 libro cada mes durante 3 meses',
    icon: '📅',
    category: 'consistency',
    requirement: 3,
    color: 'from-indigo-500 to-purple-600',
    rarity: 'rare',
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Lee al menos 1 libro cada mes durante 6 meses',
    icon: '⭐',
    category: 'consistency',
    requirement: 6,
    color: 'from-violet-500 to-purple-700',
    rarity: 'epic',
  },
  {
    id: 'unstoppable',
    name: 'Imparable',
    description: 'Lee al menos 1 libro cada mes durante 12 meses',
    icon: '💫',
    category: 'consistency',
    requirement: 12,
    color: 'from-purple-600 to-pink-700',
    rarity: 'legendary',
  },

  // QUALITY
  {
    id: 'critic',
    name: 'Crítico',
    description: 'Valora 10 libros',
    icon: '✍️',
    category: 'quality',
    requirement: 10,
    color: 'from-amber-400 to-yellow-600',
    rarity: 'common',
  },
  {
    id: 'connoisseur',
    name: 'Conocedor',
    description: 'Valora 25 libros',
    icon: '🎭',
    category: 'quality',
    requirement: 25,
    color: 'from-amber-500 to-orange-600',
    rarity: 'rare',
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Da una puntuación de 10/10 a 5 libros',
    icon: '💯',
    category: 'quality',
    requirement: 5,
    color: 'from-yellow-500 to-amber-700',
    rarity: 'epic',
  },

  // PAGES
  {
    id: 'page_turner_1k',
    name: 'Devorador de Páginas',
    description: 'Lee 1,000 páginas en total',
    icon: '📄',
    category: 'reading',
    requirement: 1000,
    color: 'from-slate-400 to-slate-600',
    rarity: 'common',
  },
  {
    id: 'page_turner_5k',
    name: 'Adicto a las Páginas',
    description: 'Lee 5,000 páginas en total',
    icon: '📃',
    category: 'reading',
    requirement: 5000,
    color: 'from-slate-500 to-gray-700',
    rarity: 'rare',
  },
  {
    id: 'page_turner_10k',
    name: 'Maestro de las Páginas',
    description: 'Lee 10,000 páginas en total',
    icon: '📜',
    category: 'reading',
    requirement: 10000,
    color: 'from-gray-600 to-slate-800',
    rarity: 'epic',
  },
]

export function calculateAchievements(books: Book[]): {
  unlocked: Achievement[]
  inProgress: Array<Achievement & { progress: number; current: number }>
  locked: Achievement[]
} {
  const completedBooks = books.filter(b => b.status === 'completed')
  const ratedBooks = books.filter(b => b.rating !== null)
  const totalPages = completedBooks.reduce((sum, b) => sum + (b.pages || 0), 0)
  
  // Unique authors
  const uniqueAuthors = new Set(completedBooks.map(b => b.author)).size
  
  // Books with perfect rating
  const perfectRatings = ratedBooks.filter(b => b.rating === 10).length
  
  // Books completed per month (last 12 months)
  const monthsWithBooks = new Map<string, number>()
  const now = new Date()
  
  completedBooks.forEach(book => {
    if (book.completed_at) {
      const date = new Date(book.completed_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthsWithBooks.set(monthKey, (monthsWithBooks.get(monthKey) || 0) + 1)
    }
  })
  
  // Consecutive months with at least 1 book
  let consecutiveMonths = 0
  let maxConsecutiveMonths = 0
  const sortedMonths = Array.from(monthsWithBooks.keys()).sort().reverse()
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    
    if (monthsWithBooks.has(monthKey)) {
      consecutiveMonths++
      maxConsecutiveMonths = Math.max(maxConsecutiveMonths, consecutiveMonths)
    } else {
      break
    }
  }
  
  // Fastest book completion
  let fastestCompletion = Infinity
  completedBooks.forEach(book => {
    if (book.started_at && book.completed_at) {
      const start = new Date(book.started_at).getTime()
      const end = new Date(book.completed_at).getTime()
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      fastestCompletion = Math.min(fastestCompletion, days)
    }
  })
  
  // Books per month
  const booksPerMonth = new Map<string, number>()
  completedBooks.forEach(book => {
    if (book.completed_at) {
      const date = new Date(book.completed_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      booksPerMonth.set(monthKey, (booksPerMonth.get(monthKey) || 0) + 1)
    }
  })
  
  const maxBooksInMonth = Math.max(0, ...Array.from(booksPerMonth.values()))
  
  // Check each achievement
  const results = ACHIEVEMENTS.map(achievement => {
    let current = 0
    
    switch (achievement.id) {
      // Reading volume
      case 'first_book':
      case 'bibliophile':
      case 'bookworm':
      case 'master_reader':
      case 'legend':
        current = completedBooks.length
        break
      
      // Speed
      case 'speed_demon':
        current = fastestCompletion <= 3 ? 1 : 0
        break
      case 'marathon_reader':
      case 'monthly_champion':
        current = maxBooksInMonth
        break
      
      // Diversity
      case 'explorer':
      case 'diverse_mind':
      case 'world_reader':
        current = uniqueAuthors
        break
      
      // Consistency
      case 'consistent':
      case 'dedicated':
      case 'unstoppable':
        current = maxConsecutiveMonths
        break
      
      // Quality
      case 'critic':
      case 'connoisseur':
        current = ratedBooks.length
        break
      case 'perfectionist':
        current = perfectRatings
        break
      
      // Pages
      case 'page_turner_1k':
      case 'page_turner_5k':
      case 'page_turner_10k':
        current = totalPages
        break
    }
    
    const progress = Math.min(100, Math.round((current / achievement.requirement) * 100))
    const isUnlocked = current >= achievement.requirement
    
    return {
      ...achievement,
      progress,
      current,
      isUnlocked,
    }
  })
  
  return {
    unlocked: results.filter(r => r.isUnlocked).map(({ progress, current, isUnlocked, ...rest }) => rest),
    inProgress: results
      .filter(r => !r.isUnlocked && r.progress > 0)
      .map(r => ({ ...r, progress: r.progress, current: r.current })),
    locked: results.filter(r => r.progress === 0).map(({ progress, current, isUnlocked, ...rest }) => rest),
  }
}

export function getRarityColor(rarity: Achievement['rarity']) {
  switch (rarity) {
    case 'common': return 'text-gray-600'
    case 'rare': return 'text-blue-600'
    case 'epic': return 'text-purple-600'
    case 'legendary': return 'text-amber-600'
  }
}

export function getRarityBg(rarity: Achievement['rarity']) {
  switch (rarity) {
    case 'common': return 'bg-gray-100 border-gray-300'
    case 'rare': return 'bg-blue-100 border-blue-300'
    case 'epic': return 'bg-purple-100 border-purple-300'
    case 'legendary': return 'bg-amber-100 border-amber-300'
  }
}