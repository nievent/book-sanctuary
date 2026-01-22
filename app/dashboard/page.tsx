import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getBooks, getBookStats } from "@/app/actions/books"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { BookGrid } from "@/components/dashboard/BookGrid"
import { QuickActions } from "@/components/dashboard/QuickActions"
import type { User } from "@/lib/types"

export default async function DashboardPage() {
  const user = await getUser() as User | null
  
  if (!user) {
    redirect('/login')
  }

  const [books, stats] = await Promise.all([
    getBooks(),
    getBookStats(),
  ])

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="container-elegant py-12 space-y-12">
        {/* Welcome Section */}
        <section className="animate-in">
          <h1 className="text-heading-1 font-serif text-ink-900 mb-3">
            Tu Biblioteca
          </h1>
          <p className="text-body-lg text-ink-600">
            {stats?.total || 0} {stats?.total === 1 ? 'libro' : 'libros'} en tu colección
          </p>
        </section>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Books Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-3 font-serif text-ink-900">
              Lectura Actual
            </h2>
          </div>
          <BookGrid books={books} />
        </section>

        {/* Empty State */}
        {books.length === 0 && (
          <div className="card text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-heading-3 font-serif text-ink-900 mb-3">
                Tu biblioteca está vacía
              </h3>
              <p className="text-body text-ink-600 mb-6">
                Comienza añadiendo tu primer libro y empieza a trackear tu progreso de lectura
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}