"use client"

import { Book, LogOut, User as UserIcon, BarChart3, Library, Trophy } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import type { User } from "@/lib/types"

export function DashboardHeader({ user }: { user: User }) {
  const [showMenu, setShowMenu] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-ink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-ink-900 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-ink-900">
                  Book Sanctuary
                </h1>
                <p className="text-xs text-ink-500">Tu refugio literario</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                <Library className="w-4 h-4" />
                Biblioteca
              </Link>
              <Link
                href="/stats"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === '/stats'
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Estadísticas
              </Link>
              <Link
                href="/achievements"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === '/achievements'
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Logros
              </Link>
              <Link
                href="/challenges"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === '/challenges'
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Desafíos
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink-900">
                  {user.user_metadata?.name || 'Usuario'}
                </p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-ink-100 py-2 z-20 animate-scale-in">
                  <div className="px-4 py-3 border-b border-ink-100">
                    <p className="text-sm font-medium text-ink-900">
                      {user.user_metadata?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-ink-500 truncate">{user.email}</p>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="md:hidden border-b border-ink-100 py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Library className="w-4 h-4" />
                      Biblioteca
                    </Link>
                    <Link
                      href="/stats"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Estadísticas
                    </Link>
                    <Link
                      href="/achievements"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Trophy className="w-4 h-4" />
                      Logros
                    </Link>
                  </div>
                  
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}