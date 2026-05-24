// lib/google-books.ts

export type GoogleBook = {
  id: string
  title: string
  authors: string[]
  description?: string
  pageCount?: number
  publishedDate?: string
  categories?: string[]
  isbn10?: string
  isbn13?: string
  googleImageLink?: string
}

// ─── Caché ────────────────────────────────────────────────────────────────────
const searchCache = new Map<string, { results: GoogleBook[]; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCached(key: string): GoogleBook[] | null {
  const entry = searchCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { searchCache.delete(key); return null }
  return entry.results
}

function setCache(key: string, results: GoogleBook[]) {
  if (searchCache.size >= 30) {
    const first = searchCache.keys().next().value
    if (first) searchCache.delete(first)
  }
  searchCache.set(key, { results, ts: Date.now() })
}

// ─── Google Books ─────────────────────────────────────────────────────────────
function upgradeGoogleCoverUrl(url: string): string {
  url = url.replace('http://', 'https://')
  url = url.replace('&zoom=1', '').replace('zoom=1&', '').replace('?zoom=1', '?')
  if (!url.includes('fife=')) url += (url.includes('?') ? '&' : '?') + 'fife=w600'
  return url
}

async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `&key=${apiKey}` : ''
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&printType=books${keyParam}`
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!data.items) return []

    return data.items.map((item: any): GoogleBook => {
      const ids = item.volumeInfo.industryIdentifiers || []
      const isbn13 = ids.find((x: any) => x.type === 'ISBN_13')?.identifier
      const isbn10 = ids.find((x: any) => x.type === 'ISBN_10')?.identifier
      const links = item.volumeInfo.imageLinks
      const raw = links?.extraLarge || links?.large || links?.medium || links?.thumbnail
      return {
        id: item.id,
        title: item.volumeInfo.title || 'Sin título',
        authors: item.volumeInfo.authors || ['Autor desconocido'],
        description: item.volumeInfo.description,
        pageCount: item.volumeInfo.pageCount,
        publishedDate: item.volumeInfo.publishedDate,
        categories: item.volumeInfo.categories,
        isbn13,
        isbn10,
        googleImageLink: raw ? upgradeGoogleCoverUrl(raw) : undefined,
      }
    })
  } catch { return [] }
}

// ─── Open Library ─────────────────────────────────────────────────────────────
async function searchOpenLibrary(query: string): Promise<GoogleBook[]> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,number_of_pages_median,isbn,cover_i,first_publish_year`
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!data.docs?.length) return []

    return data.docs
      .filter((doc: any) => doc.title && doc.author_name?.length)
      .map((doc: any, i: number): GoogleBook => {
        const isbns: string[] = doc.isbn || []
        const isbn13 = isbns.find((x: string) => x.length === 13)
        const isbn10 = isbns.find((x: string) => x.length === 10)
        const coverId: number | undefined = doc.cover_i

        let cover: string | undefined
        if (coverId) cover = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        else if (isbn13) cover = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
        else if (isbn10) cover = `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`

        return {
          id: `ol-${doc.key || i}`,
          title: doc.title,
          authors: doc.author_name,
          pageCount: doc.number_of_pages_median,
          publishedDate: doc.first_publish_year?.toString(),
          isbn13,
          isbn10,
          googleImageLink: cover,
        }
      })
  } catch { return [] }
}

// ─── Merge: desduplicar por ISBN, Google Books tiene preferencia ──────────────
function mergeResults(google: GoogleBook[], openLib: GoogleBook[]): GoogleBook[] {
  // Índice de ISBNs ya presentes desde Google Books
  const seenIsbns = new Set<string>()
  const seenTitles = new Set<string>()

  for (const book of google) {
    if (book.isbn13) seenIsbns.add(book.isbn13)
    if (book.isbn10) seenIsbns.add(book.isbn10)
    seenTitles.add(normalizeTitle(book.title))
  }

  // Solo añadir resultados de OL que no estén ya en Google Books
  const uniqueOL = openLib.filter(book => {
    if (book.isbn13 && seenIsbns.has(book.isbn13)) return false
    if (book.isbn10 && seenIsbns.has(book.isbn10)) return false
    // Deduplicar también por título normalizado por si no tienen ISBN
    const t = normalizeTitle(book.title)
    if (seenTitles.has(t)) return false
    seenTitles.add(t)
    return true
  })

  // Intercalar: 2 Google, 1 OL, 2 Google, 1 OL… para mezclar portadas
  const merged: GoogleBook[] = []
  let gi = 0, oi = 0
  while (gi < google.length || oi < uniqueOL.length) {
    if (gi < google.length) merged.push(google[gi++])
    if (gi < google.length) merged.push(google[gi++])
    if (oi < uniqueOL.length) merged.push(uniqueOL[oi++])
  }

  return merged
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Búsqueda híbrida en paralelo:
 * - Google Books: portadas de alta calidad
 * - Open Library: más variedad, sin rate limit
 * Los resultados se mezclan e intercalan, deduplicando por ISBN.
 * 1 petición a cada API → máximo 2 peticiones por búsqueda, con caché.
 */
export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query || query.length < 3) return []

  const cacheKey = query.toLowerCase().trim()
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Buscar en paralelo — si una falla, la otra sigue
  const [googleResults, olResults] = await Promise.allSettled([
    searchGoogleBooks(query),
    searchOpenLibrary(query),
  ])

  const google = googleResults.status === 'fulfilled' ? googleResults.value : []
  const openLib = olResults.status === 'fulfilled' ? olResults.value : []

  const results = mergeResults(google, openLib)
  setCache(cacheKey, results)
  return results
}

export function getCoverUrlSync(book: GoogleBook, _size: 'S' | 'M' | 'L' = 'L'): string | null {
  return book.googleImageLink || null
}

// Compatibilidad con código existente
export async function getBookCover(book: GoogleBook, size: 'S' | 'M' | 'L' = 'L'): Promise<string | null> {
  return getCoverUrlSync(book, size)
}

export async function getBestCover(_t: string, _a: string, isbn?: string): Promise<string | null> {
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null
}

export async function getGoogleBooksCover(isbn: string): Promise<string | null> {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}