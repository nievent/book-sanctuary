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

        {/* Books Grid con Filtros */}
        <section>
          <div className="mb-6">
            <h2 className="text-heading-3 font-serif text-ink-900">
              Todos tus Libros
            </h2>
            <p className="text-ink-600 mt-1">
              Filtra y ordena tu colección
            </p>
          </div>
          <BookGrid books={books} stats={stats} />
        </section>
      </main>
    </div>
  )
}