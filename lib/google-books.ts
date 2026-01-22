export type GoogleBook = {
  id: string
  title: string
  authors: string[]
  description?: string
  pageCount?: number
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
  }
  publishedDate?: string
  categories?: string[]
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

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title || 'Sin título',
      authors: item.volumeInfo.authors || ['Autor desconocido'],
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      imageLinks: item.volumeInfo.imageLinks,
      publishedDate: item.volumeInfo.publishedDate,
      categories: item.volumeInfo.categories,
    }))
  } catch (error) {
    console.error('Error searching books:', error)
    return []
  }
}

export function getBookCover(book: GoogleBook, size: 'small' | 'large' = 'large'): string | null {
  if (!book.imageLinks) return null
  
  const url = size === 'large' 
    ? book.imageLinks.thumbnail 
    : book.imageLinks.smallThumbnail
  
  // Mejorar calidad de la imagen
  return url?.replace('&edge=curl', '').replace('zoom=1', 'zoom=2') || null
}