"use client"

import { Eye, Save } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateProfileVisibility } from "@/app/actions/auth"
import type { ProfileVisibility } from "@/lib/profile"

const OPTIONS: Array<{ key: keyof ProfileVisibility; title: string; description: string }> = [
  { key: "showProfile", title: "Aparecer en búsquedas", description: "Otros usuarios podrán encontrarte por tu nombre." },
  { key: "showBooks", title: "Mostrar mi biblioteca", description: "Permite ver los libros de tu perfil público." },
  { key: "showRatings", title: "Mostrar valoraciones", description: "Comparte la nota que has dado a cada libro." },
  { key: "showNotes", title: "Mostrar comentarios", description: "Comparte las notas y reseñas que escribes." },
  { key: "showProgress", title: "Mostrar progreso y fechas", description: "Incluye páginas, fecha de inicio y de finalización." },
  { key: "showStats", title: "Mostrar resumen y gráficas", description: "Comparte los contadores y gráficas de lectura del perfil." },
]

export function ProfileSettingsForm({ initialVisibility }: { initialVisibility: ProfileVisibility }) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateProfileVisibility(visibility)
      if (result.error) toast.error(result.error)
      else toast.success("Preferencias de perfil guardadas")
    })
  }

  return (
    <section className="card max-w-3xl">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100"><Eye className="h-5 w-5 text-sage-700" /></div>
        <div><h2 className="font-serif text-2xl font-semibold text-ink-900">Visibilidad de tu perfil</h2><p className="mt-1 text-sm text-ink-600">Elige qué pueden consultar otros usuarios cuando visitan tu perfil.</p></div>
      </div>
      <div className="divide-y divide-ink-100 rounded-xl border border-ink-100">
        {OPTIONS.map((option) => (
          <label key={option.key} className="flex cursor-pointer items-start gap-4 p-4 hover:bg-cream-50">
            <input type="checkbox" checked={visibility[option.key]} onChange={(event) => setVisibility((current) => ({ ...current, [option.key]: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-ink-300 text-sage-600 focus:ring-sage-500" />
            <span><span className="block font-medium text-ink-900">{option.title}</span><span className="mt-1 block text-sm text-ink-600">{option.description}</span></span>
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end"><button type="button" onClick={save} disabled={isPending} className="btn-primary inline-flex items-center gap-2"><Save className="h-4 w-4" />{isPending ? "Guardando..." : "Guardar preferencias"}</button></div>
    </section>
  )
}
