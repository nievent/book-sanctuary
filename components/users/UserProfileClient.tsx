"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, Star } from "lucide-react"
import { useMemo, useState } from "react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PublicUserProfile } from "@/app/actions/social"
import { ReadOnlyBookCard } from "@/components/users/ReadOnlyBookCard"

const STATUS_LABELS: Record<string, string> = {
  all: "Todos",
  to_read: "Por leer",
  reading: "Leyendo",
  completed: "Completados",
  dropped: "Dropeados",
}

export function UserProfileClient({ profile }: { profile: PublicUserProfile }) {
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState("recent")

  const statusData = useMemo(() => [
    { name: "Por leer", value: profile.books.filter((book) => book.status === "to_read").length, color: "#d6c39d" },
    { name: "Leyendo", value: profile.books.filter((book) => book.status === "reading").length, color: "#8faa83" },
    { name: "Completados", value: profile.books.filter((book) => book.status === "completed").length, color: "#587452" },
    { name: "Dropeados", value: profile.books.filter((book) => book.status === "dropped").length, color: "#c46b6b" },
  ].filter((item) => item.value > 0), [profile.books])

  const ratingData = useMemo(() => Array.from({ length: 5 }, (_, index) => {
    const rating = index + 1
    return {
      name: `${rating}-${rating + 1}`,
      value: profile.books.filter((book) => book.rating !== null && book.rating >= rating && book.rating < rating + 1).length,
    }
  }), [profile.books])

  const books = useMemo(() => profile.books
    .filter((book) => status === "all" || book.status === status)
    .sort((a, b) => {
      if (sort === "rating") return (b.rating ?? -1) - (a.rating ?? -1)
      if (sort === "title") return a.title.localeCompare(b.title, "es")
      if (sort === "completed") return new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }), [profile.books, sort, status])

  const ratedBooks = profile.books.filter((book) => book.rating !== null)
  const averageRating = ratedBooks.length
    ? (ratedBooks.reduce((sum, book) => sum + (book.rating ?? 0), 0) / ratedBooks.length).toFixed(1)
    : null

  return (
    <main className="container-elegant py-10 space-y-8">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Volver a usuarios
      </Link>

      <section className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        <div className="h-28 bg-gradient-to-r from-sage-700 via-sage-600 to-sage-400" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-ink-900 font-serif text-4xl text-cream-50 shadow-soft">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-ink-900">{profile.name}</h1>
              <p className="mt-1 text-ink-600">Su rincón de lectura</p>
            </div>
            {profile.visibility.showStats && (
              <div className="flex gap-6 text-sm text-ink-600">
                <span><strong className="text-lg text-ink-900">{profile.books.length}</strong> libros</span>
                <span><strong className="text-lg text-ink-900">{profile.books.filter((book) => book.status === "completed").length}</strong> terminados</span>
                {averageRating && <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><strong className="text-lg text-ink-900">{averageRating}</strong> media</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {profile.visibility.showStats && <section className="grid gap-6 lg:grid-cols-2">
        <div className="card h-80">
          <h2 className="mb-4 font-serif text-xl font-semibold text-ink-900">Biblioteca por estado</h2>
          {statusData.length ? (
            <ResponsiveContainer width="100%" height="88%">
              <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>{statusData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
        <div className="card h-80">
          <h2 className="mb-4 font-serif text-xl font-semibold text-ink-900">Distribución de valoraciones</h2>
          {ratedBooks.length ? (
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={ratingData}><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#78966f" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
      </section>}

      {profile.visibility.showBooks ? <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="font-serif text-2xl font-semibold text-ink-900">Libros</h2><p className="text-sm text-ink-600">Selecciona una ficha para leer su comentario.</p></div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-elegant w-auto py-2 text-sm">
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-elegant w-auto py-2 text-sm">
              <option value="recent">Añadidos recientemente</option><option value="completed">Completados recientemente</option><option value="rating">Mejor valorados</option><option value="title">Título A-Z</option>
            </select>
          </div>
        </div>
        {books.length ? <div className="grid gap-5 lg:grid-cols-2">{books.map((book) => <ReadOnlyBookCard key={book.id} book={book} />)}</div> : <div className="card-subtle py-12 text-center text-ink-600">No hay libros con este filtro.</div>}
      </section> : <section className="card-subtle py-12 text-center text-ink-600">Esta persona ha mantenido su biblioteca privada.</section>}
    </main>
  )
}

function EmptyChart() {
  return <div className="flex h-[88%] flex-col items-center justify-center gap-2 text-ink-500"><BookOpen className="h-8 w-8 text-sage-500" /><p className="text-sm">Aún no hay datos para mostrar.</p></div>
}
