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
      }
    })

  } catch (error) {
    console.error('Error searching books:', error)
    return []
  }
}
export function getOpenLibraryCover(
  book: GoogleBook,
  size: 'S' | 'M' | 'L' = 'L'
): string | null {
  const isbn = book.isbn13 || book.isbn10
  if (!isbn) return null

  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
}
