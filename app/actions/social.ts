"use server"

import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Book } from "@/lib/types"

export type PublicUserBook = Pick<
  Book,
  | "id"
  | "title"
  | "author"
  | "status"
  | "rating"
  | "pages"
  | "current_page"
  | "cover_url"
  | "favorite"
  | "started_at"
  | "completed_at"
  | "created_at"
  | "updated_at"
>

export type UserSearchResult = {
  id: string
  name: string
  email?: string
  books: PublicUserBook[]
}

type SearchUsersResponse = {
  results: UserSearchResult[]
  error?: string
  configRequired?: boolean
}

function getProfileName(user: SupabaseUser) {
  const metadataName = user.user_metadata?.name
  return typeof metadataName === "string" && metadataName.trim()
    ? metadataName.trim()
    : "Usuario"
}

export async function searchUsersByProfileName(query: string): Promise<SearchUsersResponse> {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length < 2) {
    return { results: [] }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { results: [], error: "No autenticado" }
  }

  const admin = createAdminClient()

  if (!admin) {
    return {
      results: [],
      configRequired: true,
      error:
        "Para buscar usuarios por nombre de perfil necesitas configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    }
  }

  const matchedUsers: SupabaseUser[] = []
  const perPage = 100
  const maxPages = 10

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })

    if (error) {
      return { results: [], error: error.message }
    }

    const users = data.users ?? []
    matchedUsers.push(
      ...users.filter((candidate) =>
        getProfileName(candidate).toLowerCase().includes(normalizedQuery)
      )
    )

    if (users.length < perPage) break
  }

  if (matchedUsers.length === 0) {
    return { results: [] }
  }

  const userIds = matchedUsers.map((matchedUser) => matchedUser.id)
  const { data: books, error: booksError } = await admin
    .from("books")
    .select(
      "id,title,author,status,rating,pages,current_page,cover_url,favorite,started_at,completed_at,created_at,updated_at,user_id"
    )
    .in("user_id", userIds)
    .order("created_at", { ascending: false })

  if (booksError) {
    return { results: [], error: booksError.message }
  }

  return {
    results: matchedUsers.map((matchedUser) => ({
      id: matchedUser.id,
      name: getProfileName(matchedUser),
      email: matchedUser.email,
      books: (books ?? [])
        .filter((book) => book.user_id === matchedUser.id)
        .map(({ user_id: _userId, ...book }) => book),
    })),
  }
}
