import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getDetailedStats } from "@/app/actions/stats"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsOverview } from "@/components/stats/StatsOverview"
import { PagesReadChart } from "@/components/stats/MonthlyProgressChart"
import { BooksCompletedChart } from "@/components/stats/BooksCompletedChart"
import { RatingDistributionChart } from "@/components/stats/RatingDistributionChart"
import { StatusDistributionChart } from "@/components/stats/StatusDistributionChart"
import { RecentBooksTimeline } from "@/components/stats/RecentBooksTimeline"
import { AuthorRanking } from "@/components/stats/AuthorRanking"
import { ReadingPaceChart } from "@/components/stats/ReadingPaceChart"
import { Predictions } from "@/components/stats/Predictions"
import { WordCloud } from "@/components/stats/WordCloud"
import { ReadingGoals } from "@/components/stats/ReadingGoals"
import { BestBooks } from "@/components/stats/BestBooks"
import type { User } from "@/lib/types"

export default async function StatsPage() {
  const user = await getUser() as User | null
  
  if (!user) {
    redirect('/login')
  }

  const stats = await getDetailedStats()

  if (!stats) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="container-elegant py-12 space-y-12">
        {/* Welcome Section */}
        <section className="animate-in">
          <h1 className="text-heading-1 font-serif text-ink-900 mb-3">
            Estadísticas de Lectura
          </h1>
          <p className="text-body-lg text-ink-600">
            Visualiza tu progreso y descubre tus patrones de lectura
          </p>
        </section>

        {/* Stats Overview */}
        <StatsOverview stats={stats.general} />

        {/* Best Books */}
        <BestBooks data={stats.bestBooks} />

        {/* Predictions */}
        <Predictions data={stats.predictions} />

        {/* Reading Goals */}
        <ReadingGoals data={stats.goals} />

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Páginas y Libros - cada uno en su gráfico */}
          <PagesReadChart data={stats.monthlyData} />
          <BooksCompletedChart data={stats.monthlyData} />

          {/* Status Distribution */}
          <StatusDistributionChart data={stats.statusDistribution} />

          {/* Rating Distribution */}
          <RatingDistributionChart data={stats.ratingDistribution} />
        </div>

        {/* Reading Pace Evolution */}
        <ReadingPaceChart 
          data={stats.monthlyData}
          overallAverage={stats.general.avgReadingDays}
        />

        {/* Author Ranking */}
        <AuthorRanking 
          topByCount={stats.authorRanking.topByCount}
          topByRating={stats.authorRanking.topByRating}
        />

        {/* Word Cloud */}
        <WordCloud words={stats.wordCloud} />

        {/* Recent Books Timeline */}
        <RecentBooksTimeline books={stats.recentBooks} />

        {/* Reading Insights */}
        <div className="card bg-gradient-to-br from-sage-50 to-cream-100 border-2 border-sage-200">
          <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
            💡 Insights de Lectura
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <h4 className="font-medium text-ink-900 mb-1">
                    Ritmo de Lectura
                  </h4>
                  <p className="text-sm text-ink-600">
                    {stats.general.avgReadingDays > 0 ? (
                      <>
                        Tardas una media de <strong>{stats.general.avgReadingDays} días</strong> en completar un libro.
                        {stats.general.avgReadingDays < 14 && " ¡Eres muy rápido/a!"}
                        {stats.general.avgReadingDays >= 14 && stats.general.avgReadingDays < 30 && " Buen ritmo constante."}
                        {stats.general.avgReadingDays >= 30 && " Tómate tu tiempo y disfruta."}
                      </>
                    ) : (
                      "Completa más libros para ver tu ritmo de lectura."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">⭐</span>
                </div>
                <div>
                  <h4 className="font-medium text-ink-900 mb-1">
                    Criterio de Valoración
                  </h4>
                  <p className="text-sm text-ink-600">
                    {stats.general.avgRating > 0 ? (
                      <>
                        Tu valoración media es <strong>{stats.general.avgRating.toFixed(1)}/10</strong>.
                        {stats.general.avgRating >= 7.5 && " Eres generoso/a con las puntuaciones."}
                        {stats.general.avgRating >= 6 && stats.general.avgRating < 7.5 && " Tienes un criterio equilibrado."}
                        {stats.general.avgRating < 6 && " Eres muy crítico/a con tus lecturas."}
                      </>
                    ) : (
                      "Empieza a valorar tus libros para ver tu criterio."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">📖</span>
                </div>
                <div>
                  <h4 className="font-medium text-ink-900 mb-1">
                    Preferencia de Extensión
                  </h4>
                  <p className="text-sm text-ink-600">
                    {stats.general.avgPagesPerBook > 0 ? (
                      <>
                        Tus libros tienen una media de <strong>{stats.general.avgPagesPerBook} páginas</strong>.
                        {stats.general.avgPagesPerBook > 500 && " Prefieres lecturas extensas."}
                        {stats.general.avgPagesPerBook >= 300 && stats.general.avgPagesPerBook <= 500 && " Te gustan los libros de extensión media."}
                        {stats.general.avgPagesPerBook < 300 && " Prefieres lecturas más cortas."}
                      </>
                    ) : (
                      "Completa más libros para ver tu preferencia."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <h4 className="font-medium text-ink-900 mb-1">
                    Actividad Reciente
                  </h4>
                  <p className="text-sm text-ink-600">
                    {stats.general.completedThisMonth > 0 ? (
                      <>
                        Has completado <strong>{stats.general.completedThisMonth} {stats.general.completedThisMonth === 1 ? 'libro' : 'libros'}</strong> este mes.
                        {stats.general.completedThisMonth >= 4 && " ¡Excelente ritmo!"}
                        {stats.general.completedThisMonth >= 2 && stats.general.completedThisMonth < 4 && " Muy buen progreso."}
                      </>
                    ) : (
                      "Aún no has completado libros este mes."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}