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
  if (searchCache.size >= 30) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) searchCache.delete(firstKey)
  }
  searchCache.set(key, { results, ts: Date.now() })
}

// ─── Mejorar calidad de portada de Google Books ───────────────────────────────
//
// La API devuelve URLs con zoom=1 (128px). Podemos pedir mayor resolución
// cambiando el parámetro zoom o añadiendo fife=w800.
//
function upgradeGoogleCoverUrl(url: string): string {
  if (!url) return url
  // Pasar a HTTPS
  url = url.replace('http://', 'https://')
  // Eliminar zoom=1 (thumbnail) y pedir tamaño mayor
  url = url.replace('&zoom=1', '').replace('zoom=1&', '').replace('?zoom=1', '?')
  // Añadir fife=w600 para pedir 600px de ancho
  if (!url.includes('fife=')) {
    url += url.includes('?') ? '&fife=w600' : '?fife=w600'
  }
  return url
}

// ─── Google Books search (primaria, buenas portadas) ─────────────────────────
async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `&key=${apiKey}` : ''
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&printType=books${keyParam}`

    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    if (!data.items) return []

    return data.items.map((item: any): GoogleBook => {
      const identifiers = item.volumeInfo.industryIdentifiers || []
      const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13')?.identifier
      const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10')?.identifier

      const imageLinks = item.volumeInfo.imageLinks
      const rawImage =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.thumbnail

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
        googleImageLink: rawImage ? upgradeGoogleCoverUrl(rawImage) : undefined,
      }
    })
  } catch {
    return []
  }
}

// ─── Open Library search (fallback si Google Books falla) ────────────────────
async function searchOpenLibrary(query: string): Promise<GoogleBook[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,number_of_pages_median,isbn,cover_i,first_publish_year`
    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    if (!data.docs?.length) return []

    return data.docs
      .filter((doc: any) => doc.title && doc.author_name?.length)
      .map((doc: any, i: number): GoogleBook => {
        const isbns: string[] = doc.isbn || []
        const isbn13 = isbns.find((id: string) => id.length === 13)
        const isbn10 = isbns.find((id: string) => id.length === 10)
        const coverId: number | undefined = doc.cover_i

        let cover: string | undefined
        if (coverId) {
          cover = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        } else if (isbn13) {
          cover = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
        } else if (isbn10) {
          cover = `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`
        }

        return {
          id: doc.key || `ol-${i}`,
          title: doc.title,
          authors: doc.author_name,
          pageCount: doc.number_of_pages_median,
          publishedDate: doc.first_publish_year?.toString(),
          isbn13,
          isbn10,
          googleImageLink: cover,
        }
      })
  } catch {
    return []
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Busca libros con Google Books (buenas portadas) y caché.
 * Si Google Books falla, usa Open Library como fallback.
 *
 * Lo que antes mataba la quota NO era el search en sí sino los
 * checkImageUrl() que hacían 3-4 peticiones HEAD por libro.
 * Eso está eliminado — ahora solo 1 petición por búsqueda.
 */
export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query || query.length < 3) return []

  const cacheKey = query.toLowerCase().trim()
  const cached = getCached(cacheKey)
  if (cached) return cached

  let results = await searchGoogleBooks(query)

  // Fallback si Google Books no responde o está sin quota
  if (results.length === 0) {
    results = await searchOpenLibrary(query)
  }

  setCache(cacheKey, results)
  return results
}

/**
 * Devuelve la URL de portada de forma sincrónica.
 * Sin ninguna petición HTTP — los errores se manejan con onError en <img>.
 */
export function getCoverUrlSync(
  book: GoogleBook,
  _size: 'S' | 'M' | 'L' = 'L'
): string | null {
  return book.googleImageLink || null
}

// Compatibilidad con código existente (sin peticiones adicionales)
export async function getBookCover(book: GoogleBook, size: 'S' | 'M' | 'L' = 'L'): Promise<string | null> {
  return getCoverUrlSync(book, size)
}

export async function getBestCover(_title: string, _author: string, isbn?: string): Promise<string | null> {
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
  return null
}

export async function getGoogleBooksCover(isbn: string): Promise<string | null> {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}