"use client"

import { Star } from "lucide-react"
import { useState } from "react"

type RatingInputProps = {
  value?: number | null
  onChange?: (value: number) => void
  name?: string
  readOnly?: boolean
}

export function RatingInput({ value = null, onChange, name, readOnly = false }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState(value?.toString() || "")

  const displayValue = hoverValue !== null ? hoverValue : (value || 0)
  const filledStars = Math.floor(displayValue / 2)
  const hasHalfStar = displayValue % 2 >= 1

  function handleStarClick(starIndex: number) {
    if (readOnly) return
    const newValue = starIndex * 2
    setInputValue(newValue.toString())
    onChange?.(newValue)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    
    const numValue = parseFloat(val)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      onChange?.(numValue)
    }
  }

  return (
    <div className="space-y-3">
      {/* Estrellas visuales */}
      <div className="flex items-center gap-2">
        <div 
          className="flex gap-1"
          onMouseLeave={() => !readOnly && setHoverValue(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= filledStars
            const isHalf = star === filledStars + 1 && hasHalfStar

            return (
              <button
                key={star}
                type="button"
                disabled={readOnly}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => !readOnly && setHoverValue(star * 2)}
                className={`transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <Star 
                  className={`w-8 h-8 transition-colors ${
                    isFilled 
                      ? 'fill-amber-400 text-amber-400' 
                      : isHalf
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-ink-200'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* Input numérico */}
        {!readOnly && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="0.0"
              className="w-20 px-3 py-2 border border-ink-200 rounded-lg text-center font-medium text-ink-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            <span className="text-sm font-medium text-ink-600">/ 10</span>
          </div>
        )}

        {readOnly && value && (
          <span className="text-lg font-semibold text-ink-900">
            {value.toFixed(1)}
          </span>
        )}
      </div>

      {/* Descripción de la puntuación */}
      {displayValue > 0 && (
        <p className="text-sm text-ink-600 italic">
          {displayValue >= 9 ? '✨ Obra maestra' :
           displayValue >= 8 ? '🎯 Excelente' :
           displayValue >= 7 ? '👍 Muy bueno' :
           displayValue >= 6 ? '😊 Bueno' :
           displayValue >= 5 ? '👌 Aceptable' :
           displayValue >= 4 ? '😐 Regular' :
           displayValue >= 3 ? '😕 Flojo' :
           displayValue >= 2 ? '😞 Malo' :
           '💔 Terrible'}
        </p>
      )}
    </div>
  )
}