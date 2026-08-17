// lib/covers.ts
import type { SupabaseClient } from "@supabase/supabase-js"

const HOTLINK_HOSTS = ["books.google.com", "googleusercontent.com", "openlibrary.org"]

export function isHotlinkedCover(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return HOTLINK_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export async function mirrorCoverToStorage(
  sourceUrl: string,
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl)
    if (!res.ok) return null

    const contentType = res.headers.get("content-type") || "image/jpeg"
    if (!contentType.startsWith("image/")) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.byteLength > 5 * 1024 * 1024) return null // 5 MB máx

    const ext = contentType.split("/")[1]?.split(";")[0] || "jpg"
    const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from("book-covers")
      .upload(filename, buffer, { contentType, upsert: false })

    if (error) {
      console.warn("mirrorCoverToStorage upload error:", error.message)
      return null
    }

    const { data: publicData } = supabase.storage.from("book-covers").getPublicUrl(data.path)
    return publicData.publicUrl
  } catch (err) {
    console.warn("mirrorCoverToStorage fetch error:", err)
    return null
  }
}