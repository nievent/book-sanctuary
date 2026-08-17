"use server"

import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Book } from "@/lib/types"
import { getProfileVisibility, type ProfileVisibility } from "@/lib/profile"

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
  books: PublicUserBook[]
  showBooks: boolean
}

export type PublicUserProfile = {
  id: string
  name: string
  books: PublicUserBook[]
  visibility: ProfileVisibility
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

function sanitizePublicBooks(books: PublicUserBook[], visibility: ProfileVisibility): PublicUserBook[] {
  if (!visibility.showBooks) return []

  return books.map((book) => ({
    ...book,
    rating: visibility.showRatings ? book.rating : null,
    notes: visibility.showNotes ? book.notes : null,
    pages: visibility.showProgress ? book.pages : null,
    current_page: visibility.showProgress ? book.current_page : null,
    started_at: visibility.showProgress ? book.started_at : null,
    completed_at: visibility.showProgress ? book.completed_at : null,
  }))
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
    matchedUsers.push(...users.filter((candidate) =>
      getProfileVisibility(candidate.user_metadata).showProfile &&
      getProfileName(candidate).toLowerCase().includes(normalizedQuery)
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
    results: visibleUsers.map((matchedUser) => {
      const visibility = getProfileVisibility(matchedUser.user_metadata)
      return {
        id: matchedUser.id,
        name: getProfileName(matchedUser),
        showBooks: visibility.showBooks,
        books: sanitizePublicBooks((books ?? [])
          .filter((book) => book.user_id === matchedUser.id)
          .map(({ user_id: _userId, ...book }) => book), visibility),
      }
    }),
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
  const visibility = getProfileVisibility(userData.user.user_metadata)
  if (!visibility.showProfile) return { error: "Este perfil no es público" }

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
      books: sanitizePublicBooks(books ?? [], visibility),
      visibility,
    },
  }
}
