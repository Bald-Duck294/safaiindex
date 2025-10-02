'use client'

import { useState } from 'react'

const smileyFaces = [
  { value: 1, emoji: '😢', label: 'Very Poor', color: 'text-red-500' },
  { value: 2, emoji: '😞', label: 'Poor', color: 'text-red-400' },
  { value: 3, emoji: '😕', label: 'Below Average', color: 'text-orange-500' },
  { value: 4, emoji: '😐', label: 'Fair', color: 'text-orange-400' },
  { value: 5, emoji: '🙂', label: 'Average', color: 'text-yellow-500' },
  { value: 6, emoji: '😊', label: 'Good', color: 'text-yellow-400' },
  { value: 7, emoji: '😄', label: 'Very Good', color: 'text-lime-500' },
  { value: 8, emoji: '😁', label: 'Great', color: 'text-green-400' },
  { value: 9, emoji: '🤩', label: 'Excellent', color: 'text-green-500' },
  { value: 10, emoji: '🥳', label: 'Outstanding', color: 'text-emerald-500' },
]

export default function SmileyRating({ rating, onRatingChange, size = 32 }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {smileyFaces.map((smiley) => {
          const isActive = (hoverRating || rating) >= smiley.value
          const emojiSize = size === 32 ? 'text-2xl' : 'text-xl'
          const emojiColor = isActive ? smiley.color : 'grayscale'

          return (
            <button
              key={smiley.value}
              type="button"
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-200 
                hover:scale-110 hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2
                ${isActive ? 'bg-blue-50 scale-105' : ''}
              `}
              onClick={() => onRatingChange(smiley.value)}
              onMouseEnter={() => setHoverRating(smiley.value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <span className={`${emojiSize} transition-all duration-200 ${emojiColor}`}>
                {smiley.emoji}
              </span>
              <span className="text-xs text-center text-gray-600 mt-1 font-medium">
                {smiley.value}
              </span>
            </button>
          )
        })}
      </div>

      {rating > 0 && (
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700">
            {smileyFaces.find((s) => s.value === rating)?.label} ({rating}/10)
          </span>
        </div>
      )}
    </div>
  )
}
