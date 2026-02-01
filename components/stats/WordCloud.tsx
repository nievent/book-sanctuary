"use client"

import { useEffect, useRef, useState } from "react"

type WordCloudData = {
  word: string
  count: number
}

type WordCloudProps = {
  words: WordCloudData[]
}

export function WordCloud({ words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)

  if (words.length === 0) {
    return (
      <div className="card">
        <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
          ☁️ Palabras en tus Títulos
        </h3>
        <div className="text-center py-12">
          <p className="text-ink-500">
            Añade más libros para ver las palabras más comunes en tus títulos
          </p>
        </div>
      </div>
    )
  }

  // Encontrar el máximo para escalar
  const maxCount = Math.max(...words.map(w => w.count))
  const minCount = Math.min(...words.map(w => w.count))

  // Función para calcular tamaño de fuente
  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 24
    const ratio = (count - minCount) / (maxCount - minCount)
    return 14 + ratio * 40 // Entre 14px y 54px
  }

  // Función para obtener color según frecuencia
  const getColor = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    
    if (ratio > 0.7) return "text-sage-800" // Muy frecuente
    if (ratio > 0.5) return "text-sage-700"
    if (ratio > 0.3) return "text-sage-600"
    if (ratio > 0.15) return "text-sage-500"
    return "text-ink-400" // Poco frecuente
  }

  // Función para obtener peso de fuente
  const getFontWeight = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    if (ratio > 0.6) return "font-bold"
    if (ratio > 0.3) return "font-semibold"
    return "font-medium"
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-heading-3 font-serif text-ink-900">
            ☁️ Palabras en tus Títulos
          </h3>
          <p className="text-sm text-ink-600 mt-1">
            Las palabras más comunes en los títulos de tus libros
          </p>
        </div>

        {hoveredWord && (
          <div className="px-4 py-2 bg-sage-100 rounded-lg border border-sage-300">
            <p className="text-sm text-ink-600">
              <span className="font-bold text-sage-700">{hoveredWord}</span>
              {" "}aparece{" "}
              <span className="font-bold">
                {words.find(w => w.word === hoveredWord)?.count}
              </span>
              {" "}
              {words.find(w => w.word === hoveredWord)?.count === 1 ? 'vez' : 'veces'}
            </p>
          </div>
        )}
      </div>

      {/* Nube de palabras */}
      <div 
        ref={containerRef}
        className="relative min-h-[400px] bg-gradient-to-br from-cream-50 to-sage-50 rounded-xl p-8 border border-sage-200 overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 leading-relaxed">
          {words.map((item, index) => {
            const fontSize = getFontSize(item.count)
            const color = getColor(item.count)
            const fontWeight = getFontWeight(item.count)

            return (
              <span
                key={`${item.word}-${index}`}
                className={`
                  ${color} ${fontWeight}
                  cursor-pointer transition-all duration-300
                  hover:scale-110 hover:text-sage-900
                  animate-in
                  inline-block
                `}
                style={{ 
                  fontSize: `${fontSize}px`,
                  animationDelay: `${index * 30}ms`,
                  lineHeight: 1.4,
                }}
                onMouseEnter={() => setHoveredWord(item.word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                {item.word}
              </span>
            )
          })}
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-sage-200/20 rounded-full blur-2xl" />
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-cream-300/20 rounded-full blur-3xl" />
      </div>

      {/* Leyenda */}
      <div className="mt-6 p-4 bg-cream-100 rounded-lg border border-cream-300">
        <p className="text-sm text-ink-700 mb-3 font-medium">
          💡 Leyenda de frecuencia:
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sage-800 rounded-full"></span>
            <span className="text-ink-600">Muy frecuente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sage-600 rounded-full"></span>
            <span className="text-ink-600">Frecuente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sage-500 rounded-full"></span>
            <span className="text-ink-600">Común</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-ink-400 rounded-full"></span>
            <span className="text-ink-600">Poco común</span>
          </div>
        </div>
      </div>

      {/* Top 5 palabras */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {words.slice(0, 5).map((word, index) => (
          <div 
            key={word.word}
            className="text-center p-3 bg-white rounded-lg border border-sage-200 hover:border-sage-400 transition-colors"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold text-sage-700">#{index + 1}</span>
            </div>
            <p className="text-sm font-medium text-ink-900 truncate" title={word.word}>
              {word.word}
            </p>
            <p className="text-xs text-ink-500">
              {word.count} {word.count === 1 ? 'vez' : 'veces'}
            </p>
          </div>
        ))}
      </div>

      {/* Estadística divertida */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-ink-700">
          {words.length > 50 && "🌟 ¡Tienes una biblioteca muy diversa! Más de 50 palabras únicas en tus títulos."}
          {words.length > 30 && words.length <= 50 && "📚 Buena variedad de títulos. Tus libros tienen vocabulario rico."}
          {words.length > 15 && words.length <= 30 && "📖 Una colección interesante con temas variados."}
          {words.length <= 15 && words.length > 0 && "✨ Empezando tu colección. Cada libro añade nuevas palabras."}
        </p>
      </div>
    </div>
  )
}