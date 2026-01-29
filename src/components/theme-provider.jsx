'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    
    if (theme === 'dark') {
      html.classList.add('dark')
      body.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.remove('dark')
      body.classList.remove('dark')
      html.style.colorScheme = 'light'
    }
  }, [theme])

  useEffect(() => {
    // Sincronizar tema entre abas
    const handleStorageChange = (e) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Disparar evento customizado para atualizar a aba atual também
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: newTheme,
      url: window.location.href
    }))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
