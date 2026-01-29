'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, MessageSquare, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      gradient: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Agendamentos',
      href: '/dashboard/appointments',
      icon: Calendar,
      gradient: 'from-gray-600 to-slate-700',
    },
    {
      name: 'Clientes',
      href: '/dashboard/customers',
      icon: Users,
      gradient: 'from-slate-600 to-gray-700',
    },
    {
      name: 'Conversas',
      href: '/dashboard/conversations',
      icon: MessageSquare,
      gradient: 'from-gray-700 to-slate-800',
    },
  ]

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card/50 backdrop-blur-lg">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Painel de Controle</p>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r shadow-md ' + item.gradient + ' text-white'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                    active
                      ? 'bg-white/20'
                      : 'bg-secondary'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-muted-foreground')} />
                </div>
                <span className={cn('font-medium', active ? 'text-white' : '')}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary transition-all duration-200 group-hover:bg-red-100 dark:group-hover:bg-red-900/30">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
