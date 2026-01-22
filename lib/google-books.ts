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

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query || query.length < 2) return []

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&printType=books`
    )

    if (!response.ok) return []

    const data = await response.json()

    if (!data.items) return []

    return data.items.map((item: any) => {
      const identifiers = item.volumeInfo.industryIdentifiers || []

      const isbn13 = identifiers.find(
        (id: any) => id.type === 'ISBN_13'
      )?.identifier

      const isbn10 = identifiers.find(
        (id: any) => id.type === 'ISBN_10'
      )?.identifier

      // Intentar obtener la imagen de mayor calidad de Google Books
      let googleImageLink = null
      if (item.volumeInfo.imageLinks) {
        googleImageLink = 
          item.volumeInfo.imageLinks.extraLarge ||
          item.volumeInfo.imageLinks.large ||
          item.volumeInfo.imageLinks.medium ||
          item.volumeInfo.imageLinks.thumbnail
        
        // Mejorar la calidad removiendo el parámetro zoom
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
      }
    })

  } catch (error) {
    console.error('Error searching books:', error)
    return []
  }
}

/**
 * Intenta obtener una portada de libro desde múltiples fuentes
 * Prioridad: Google Books > Open Library > Archive.org
 */
export async function getBookCover(
  book: GoogleBook,
  size: 'S' | 'M' | 'L' = 'L'
): Promise<string | null> {
  // 1. Intentar con la imagen directa de Google Books (mejor calidad)
  if (book.googleImageLink) {
    const isValid = await checkImageUrl(book.googleImageLink)
    if (isValid) return book.googleImageLink
  }

  // 2. Intentar con Open Library usando ISBN
  const isbn = book.isbn13 || book.isbn10
  if (isbn) {
    const openLibraryUrl = getOpenLibraryCover(isbn, size)
    const isValid = await checkImageUrl(openLibraryUrl)
    if (isValid) return openLibraryUrl
  }

  // 3. Intentar buscar en Open Library por título y autor
  if (book.title && book.authors[0]) {
    const searchCover = await searchOpenLibraryCover(book.title, book.authors[0])
    if (searchCover) return searchCover
  }

  return null
}

/**
 * Open Library - API de portadas por ISBN
 * Gratis, sin límite, buena calidad
 */
function getOpenLibraryCover(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
}

/**
 * Buscar portada en Open Library por título y autor
 */
async function searchOpenLibraryCover(title: string, author: string): Promise<string | null> {
  try {
    const query = `${title} ${author}`.toLowerCase()
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.docs && data.docs.length > 0) {
      const coverId = data.docs[0].cover_i
      if (coverId) {
        return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      }
    }
    
    return null
  } catch (error) {
    console.error('Error searching Open Library:', error)
    return null
  }
}

/**
 * Verifica si una URL de imagen es válida y existe
 */
async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.includes('image') ?? false)
  } catch {
    return false
  }
}

/**
 * Google Books - Buscar portada por ISBN (alternativa)
 */
export async function getGoogleBooksCover(isbn: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const imageLinks = data.items[0].volumeInfo.imageLinks
      if (imageLinks) {
        return imageLinks.large || imageLinks.medium || imageLinks.thumbnail
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting Google Books cover:', error)
    return null
  }
}

/**
 * Función helper para obtener la mejor portada disponible
 * Uso simplificado para el frontend
 */
export async function getBestCover(
  title: string, 
  author: string, 
  isbn?: string
): Promise<string | null> {
  // Si tenemos ISBN, intentar primero con Open Library
  if (isbn) {
    const openLibraryUrl = getOpenLibraryCover(isbn, 'L')
    const isValid = await checkImageUrl(openLibraryUrl)
    if (isValid) return openLibraryUrl
    
    // Intentar con Google Books
    const googleCover = await getGoogleBooksCover(isbn)
    if (googleCover) return googleCover
  }
  
  // Buscar por título y autor en Open Library
  const searchCover = await searchOpenLibraryCover(title, author)
  if (searchCover) return searchCover
  
  return null
}

/**
 * Función sincrónica para obtener URL de portada (sin verificación)
 * Útil cuando necesitas una URL inmediata sin async
 */
export function getCoverUrlSync(
  book: GoogleBook,
  size: 'S' | 'M' | 'L' = 'L'
): string | null {
  // 1. Imagen de Google Books si existe
  if (book.googleImageLink) {
    return book.googleImageLink
  }
  
  // 2. Open Library por ISBN
  const isbn = book.isbn13 || book.isbn10
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
  }
  
  return null
}