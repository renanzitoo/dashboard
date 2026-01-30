'use client'

import { Sidebar } from '@/components/sidebar'
import { useMobileMenu } from '@/lib/hooks/useMobileMenu'
import { Menu } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { isOpen, isMobile, toggle } = useMobileMenu()

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))' }}>
      <Sidebar isOpen={isOpen} onClose={toggle} />
      
      <div className="flex-1 lg:ml-72">
        {/* Header mobile com menu hambúrguer */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card/80 backdrop-blur-lg px-4 lg:hidden">
          <button
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4E98D9] to-[#566D8C] text-white shadow-lg transition-transform hover:scale-105"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-4 text-lg font-bold text-foreground">Dashboard</h1>
        </header>
        
        {children}
      </div>
    </div>
  )
}
