'use client'

import { useState } from 'react'
import Image from 'next/image'

export function FloatingAppButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border border-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 dark:border-gray-600"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        window.location.href = '/sobre'
      }}
      aria-label="Ícone da aplicação"
    >
      {/* Ícone da aplicação */}
      <div className="relative w-8 h-8 transition-transform duration-300 group-hover:rotate-12">
        <Image
          src="/icon.png"
          alt="App Icon"
          width={32}
          height={32}
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Ripple effect quando hover */}
      {isHovered && (
        <span className="absolute inset-0 rounded-full bg-blue-500 opacity-10 animate-ping" />
      )}
    </button>
  )
}
