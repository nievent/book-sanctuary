// components/dashboard/DashboardHeader.tsx
"use client"

import { Book, LogOut, User as UserIcon, BarChart3, Library, Trophy, Sparkles, Users, Settings } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import type { User } from "@/lib/types"

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Biblioteca',        Icon: Library },
  { href: '/stats',            label: 'Estadísticas',      Icon: BarChart3 },
  { href: '/achievements',     label: 'Logros',            Icon: Trophy },
  { href: '/challenges',       label: 'Desafíos',          Icon: null },   // custom svg
  { href: '/recommendations',  label: 'Recomendaciones',   Icon: Sparkles },
  { href: '/users',            label: 'Usuarios',          Icon: Users },
]

export function DashboardHeader({ user }: { user: User }) {
  const [showMenu, setShowMenu] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-ink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              <div className="w-10 h-10 bg-ink-900 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-cream-50" />
              </div>
              <div className="hidden lg:block">
                <h1 className="font-serif text-xl font-semibold text-ink-900">Book Sanctuary</h1>
                <p className="text-xs text-ink-500">Tu refugio literario</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-cream-100'
                    }`}
                  >
                    {Icon ? (
                      <Icon className="w-4 h-4" />
                    ) : (
                      /* Icono custom para Desafíos */
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )}
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink-900">{user.user_metadata?.name || 'Usuario'}</p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-ink-100 py-2 z-20 animate-scale-in">
                  <div className="px-4 py-3 border-b border-ink-100">
                    <p className="text-sm font-medium text-ink-900">{user.user_metadata?.name || 'Usuario'}</p>
                    <p className="text-xs text-ink-500 truncate">{user.email}</p>
                  </div>

                  {/* Mobile nav */}
                  <div className="md:hidden border-b border-ink-100 py-2">
                    {NAV_ITEMS.map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        {Icon ? <Icon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {label}
                      </Link>
                    ))}
                  </div>

                  <Link href="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors">
                    <Settings className="w-4 h-4" /> Configurar perfil
                  </Link>

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
