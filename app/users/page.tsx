import { redirect } from "next/navigation"
import { Search, Users } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { searchUsersByProfileName } from "@/app/actions/social"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ReadOnlyBookCard } from "@/components/users/ReadOnlyBookCard"
import type { User } from "@/lib/types"

type UsersPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = (await getUser()) as User | null

  if (!user) {
    redirect("/login")
  }

  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const search = query.length >= 2 ? await searchUsersByProfileName(query) : { results: [] }

  return (
    <div className="min-h-screen bg-cream-50">
      <DashboardHeader user={user} />

      <main className="container-elegant py-12 space-y-10">
        <section className="animate-in">
          <h1 className="text-heading-1 font-serif text-ink-900 mb-3">
            Buscar Usuarios
          </h1>
          <p className="text-body-lg text-ink-600">
            Encuentra perfiles por nombre y consulta sus libros en modo lectura.
          </p>
        </section>

        <section className="card">
          <form className="flex flex-col sm:flex-row gap-3" action="/users">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                placeholder="Nombre de perfil"
                className="input-elegant pl-12"
              />
            </div>
            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </section>

        {search.error && (
          <section className="card border-amber-200 bg-amber-50">
            <h2 className="font-serif text-xl font-semibold text-ink-900 mb-2">
              {search.configRequired ? "Falta configurar Supabase" : "No se pudo buscar"}
            </h2>
            <p className="text-ink-700">{search.error}</p>
          </section>
        )}

        {!search.error && query.length > 0 && query.length < 2 && (
          <section className="card-subtle text-center py-10">
            <p className="text-ink-600">Escribe al menos 2 caracteres para buscar.</p>
          </section>
        )}

        {!search.error && query.length >= 2 && search.results.length === 0 && (
          <section className="card text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
              <Users className="w-10 h-10 text-sage-600" />
            </div>
            <h2 className="text-heading-3 font-serif text-ink-900 mb-3">
              No hay usuarios para "{query}"
            </h2>
            <p className="text-ink-600">Prueba con otro nombre de perfil.</p>
          </section>
        )}

        {!search.error && search.results.length > 0 && (
          <section className="space-y-8">
            {search.results.map((result) => (
              <div key={result.id} className="space-y-4 animate-in">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <h2 className="text-heading-3 font-serif text-ink-900">{result.name}</h2>
                    {result.email && <p className="text-sm text-ink-500">{result.email}</p>}
                  </div>
                  <p className="text-sm text-ink-600">
                    {result.books.length} {result.books.length === 1 ? "libro" : "libros"}
                  </p>
                </div>

                {result.books.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-5">
                    {result.books.map((book) => (
                      <ReadOnlyBookCard key={book.id} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="card-subtle py-8 text-center">
                    <p className="text-ink-600">Este usuario aun no tiene libros.</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
