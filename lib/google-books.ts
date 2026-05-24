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
  source?: 'openlibrary' | 'google'
}

// ─── Caché en sesión ──────────────────────────────────────────────────────────
const searchCache = new Map<string, { results: GoogleBook[]; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 min

function getCached(key: string): GoogleBook[] | null {
  const entry = searchCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    searchCache.delete(key)
    return null
  }
  return entry.results
}

function setCache(key: string, results: GoogleBook[]) {
  // Limitar el caché a 20 entradas para no consumir memoria
  if (searchCache.size >= 20) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) searchCache.delete(firstKey)
  }
  searchCache.set(key, { results, ts: Date.now() })
}

// ─── Open Library (primaria, sin rate limit) ──────────────────────────────────
async function searchOpenLibrary(query: string): Promise<GoogleBook[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,number_of_pages_median,isbn,cover_i,first_publish_year`
    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    if (!data.docs?.length) return []

    return data.docs.map((doc: any, i: number) => {
      const isbn13 = doc.isbn?.find((id: string) => id.length === 13)
      const isbn10 = doc.isbn?.find((id: string) => id.length === 10)
      const coverId = doc.cover_i

      let imageLink: string | undefined
      if (coverId) {
        imageLink = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      } else if (isbn13) {
        imageLink = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
      } else if (isbn10) {
        imageLink = `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`
      }

      return {
        id: doc.key || `ol-${i}`,
        title: doc.title || 'Sin título',
        authors: doc.author_name || ['Autor desconocido'],
        pageCount: doc.number_of_pages_median,
        publishedDate: doc.first_publish_year?.toString(),
        isbn13,
        isbn10,
        googleImageLink: imageLink,
        source: 'openlibrary' as const,
      }
    })
  } catch {
    return []
  }
}

// ─── Google Books (fallback) ──────────────────────────────────────────────────
async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  try {
    // Añade ?key=TU_API_KEY aquí para aumentar el límite a 1000 req/día
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `&key=${apiKey}` : ''
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&printType=books${keyParam}`

    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    if (!data.items) return []

    return data.items.map((item: any) => {
      const identifiers = item.volumeInfo.industryIdentifiers || []
      const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13')?.identifier
      const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10')?.identifier

      let googleImageLink: string | undefined
      if (item.volumeInfo.imageLinks) {
        googleImageLink =
          item.volumeInfo.imageLinks.extraLarge ||
          item.volumeInfo.imageLinks.large ||
          item.volumeInfo.imageLinks.medium ||
          item.volumeInfo.imageLinks.thumbnail

        if (googleImageLink) {
          googleImageLink = googleImageLink.replace('&zoom=1', '').replace('zoom=1', '')
          googleImageLink = googleImageLink.replace('http://', 'https://')
        }
      }

      return {
        id: item.id,
        title: item.volumeInfo.title || 'Sin título',
        authors: item.volumeInfo.authors || ['Autor desconocido'],
        description: item.volumeInfo.description,
        pageCount: item.volumeInfo.pageCount,
        publishedDate: item.volumeInfo.publishedDate,
        categories: item.volumeInfo.categories,
        isbn10,
        isbn13,
        googleImageLink,
        source: 'google' as const,
      }
    })
  } catch {
    return []
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Busca libros usando Open Library primero (sin límites),
 * con Google Books como fallback si no hay resultados.
 * Los resultados se cachean 5 minutos.
 */
export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query || query.length < 3) return []

  const cacheKey = query.toLowerCase().trim()
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Open Library primero
  let results = await searchOpenLibrary(query)

  // Fallback a Google Books si no hay nada
  if (results.length === 0) {
    results = await searchGoogleBooks(query)
  }

  setCache(cacheKey, results)
  return results
}

/**
 * Devuelve la URL de portada de forma sincrónica (sin verificación HTTP).
 * Los errores de imagen se gestionan con onError en el <img>.
 */
export function getCoverUrlSync(
  book: GoogleBook,
  size: 'S' | 'M' | 'L' = 'L'
): string | null {
  if (book.googleImageLink) return book.googleImageLink

  const isbn = book.isbn13 || book.isbn10
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`

  return null
}

// Mantenemos compatibilidad con el código existente
export async function getBookCover(
  book: GoogleBook,
  size: 'S' | 'M' | 'L' = 'L'
): Promise<string | null> {
  return getCoverUrlSync(book, size)
}

export async function getBestCover(
  title: string,
  author: string,
  isbn?: string
): Promise<string | null> {
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
  return null
}

export async function getGoogleBooksCover(isbn: string): Promise<string | null> {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}