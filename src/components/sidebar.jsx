'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, MessageSquare, LayoutDashboard, LogOut, Moon, Sun, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
export function Sidebar({ isOpen, onClose }) {
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
      href: '/dashboard-service',
      icon: LayoutDashboard,
      gradient: 'from-[#4E98D9] to-[#566D8C]',
      color: '#4E98D9',
    },
    {
      name: 'Agendamentos',
      href: '/dashboard-service/appointments',
      icon: Calendar,
      gradient: 'from-[#72C1F2] to-[#4E98D9]',
      color: '#72C1F2',
    },
    {
      name: 'Clientes',
      href: '/dashboard-service/customers',
      icon: Users,
      gradient: 'from-[#4E98D9] to-[#72C1F2]',
      color: '#4E98D9',
    },
    {
      name: 'Conversas',
      href: '/dashboard-service/conversations',
      icon: MessageSquare,
      gradient: 'from-[#79D0F2] to-[#72C1F2]',
      color: '#79D0F2',
    },
  ]
  const isActive = (href) => {
    if (href === '/dashboard-service') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card/95 backdrop-blur-lg transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
<button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4E98D9] to-[#566D8C] shadow-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold text-foreground">
                  Atendimento
                </h1>
                <p className="text-xs text-muted-foreground">Painel de Controle</p>
              </div>
            </div>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="Alternar tema"
            suppressHydrationWarning
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
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
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                    active
                      ? 'bg-white/20'
                      : 'bg-secondary/50'
                  )}
                  style={!active ? {backgroundColor: item.color + '15'} : {}}
                >
                  <Icon 
                    className={cn('h-5 w-5', active ? 'text-white' : '')} 
                    style={!active ? {color: item.color} : {}}
                  />
                </div>
                <span className={cn('font-medium', active ? 'text-white' : '')}>{item.name}</span>
              </Link>
            )
          })}
        </nav>
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
    </>
  )
}
