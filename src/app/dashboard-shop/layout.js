'use client'

import { ShopSidebar } from '@/components/shop-sidebar'
import { useMobileMenu } from '@/lib/hooks/useMobileMenu'
import { Menu } from 'lucide-react'

export default function ShopLayout({ children }) {
  const { isOpen, toggle } = useMobileMenu()

  return (
    <div className="min-h-screen bg-background">
      <ShopSidebar isOpen={isOpen} onClose={toggle} />

      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur px-4 lg:hidden">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Loja</span>
      </div>

      <main className="main-content-shop">
        {children}
      </main>
    </div>
  )
}
