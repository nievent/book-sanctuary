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
  | "notes"
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

export type PublicUserProfile = {
  id: string
  name: string
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
  const maxPages = normalizedQuery ? 10 : 1

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })

    if (error) {
      return { results: [], error: error.message }
    }

    const users = data.users ?? []
    matchedUsers.push(...users.filter((candidate) =>
      !normalizedQuery || getProfileName(candidate).toLowerCase().includes(normalizedQuery)
    ))

    if (users.length < perPage) break
  }

  if (matchedUsers.length === 0) {
    return { results: [] }
  }

  const visibleUsers = matchedUsers.slice(0, 24)
  const userIds = visibleUsers.map((matchedUser) => matchedUser.id)
  const { data: books, error: booksError } = await admin
    .from("books")
    .select(
      "id,title,author,status,rating,pages,current_page,cover_url,notes,favorite,started_at,completed_at,created_at,updated_at,user_id"
    )
    .in("user_id", userIds)
    .order("created_at", { ascending: false })

  if (booksError) {
    return { results: [], error: booksError.message }
  }

  return {
    results: visibleUsers.map((matchedUser) => ({
      id: matchedUser.id,
      name: getProfileName(matchedUser),
      email: matchedUser.email,
      books: (books ?? [])
        .filter((book) => book.user_id === matchedUser.id)
        .map(({ user_id: _userId, ...book }) => book),
    })),
  }
}

export async function getPublicUserProfile(id: string): Promise<{
  profile?: PublicUserProfile
  error?: string
  configRequired?: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "No autenticado" }

  const admin = createAdminClient()
  if (!admin) {
    return {
      configRequired: true,
      error: "Para consultar perfiles necesitas configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    }
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(id)
  if (userError || !userData.user) return { error: "Usuario no encontrado" }

  const { data: books, error: booksError } = await admin
    .from("books")
    .select("id,title,author,status,rating,pages,current_page,cover_url,notes,favorite,started_at,completed_at,created_at,updated_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  if (booksError) return { error: booksError.message }

  return {
    profile: {
      id: userData.user.id,
      name: getProfileName(userData.user),
      books: books ?? [],
    },
  }
}
