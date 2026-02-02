'use client'

import { Sidebar } from '@/components/sidebar'
import { useMobileMenu } from '@/lib/hooks/useMobileMenu'
import { Menu } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { isOpen, toggle } = useMobileMenu()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isOpen} onClose={toggle} />

      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur px-4 lg:hidden">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Atendimentos</span>
      </div>

      <main className="main-content-appointments">
        {children}
      </main>
    </div>
  )
}
