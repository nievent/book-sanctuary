// app/recommendations/page.tsx
import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { RecommendationsClient } from "@/components/recommendations/RecommendationsClient"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"

export default async function RecommendationsPage() {
  const user = await getUser() as User | null
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('status, rating')
    .eq('user_id', user.id)

  const ratedCount = books?.filter(b => b.status === 'completed' && b.rating !== null).length ?? 0

  return (
    <div className="min-h-screen bg-cream-50">
      <DashboardHeader user={user} />
      <main className="container-elegant py-12">
        <RecommendationsClient ratedBooksCount={ratedCount} />
      </main>
    </div>
  )
}