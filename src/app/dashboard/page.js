'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, MessageSquare, CheckCircle, Clock, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    customers: 0,
    conversations: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef({ appointments: Date.now(), customers: Date.now(), conversations: Date.now() })

  const loadStats = useCallback(async () => {
    try {
      // Appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status')
        .order('created_at', { ascending: false })

      // Customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')

      // Conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')



      const total = appointments?.length || 0
      const completed = appointments?.filter(a => a.status === 'completed').length || 0
      const pending = appointments?.filter(a => a.status === 'pending').length || 0
      const cancelled = appointments?.filter(a => a.status === 'cancelled').length || 0
      const customersCount = customers?.length || 0
      const conversationsCount = conversations?.length || 0

      setStats({ 
        total, 
        completed, 
        pending, 
        cancelled,
        customers: customersCount,
        conversations: conversationsCount,
      })
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkWebhooks = useCallback(async () => {
    try {
      const tables = ['appointments', 'customers', 'conversations']
      let hasChanges = false
      
      for (const table of tables) {
        const response = await fetch(`/api/webhook?table=${table}&since=${lastCheckRef.current[table]}`)
        const data = await response.json()
        
        if (data.hasChanges) {
          lastCheckRef.current[table] = data.timestamp
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        loadStats()
      }
    } catch (error) {
    }
  }, [loadStats])

  useEffect(() => {
    loadStats()
    
    // Verifica webhooks a cada 2 segundos
    const interval = setInterval(checkWebhooks, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [loadStats, checkWebhooks])

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0

  return (
    <div className="min-h-screen pb-6">
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl font-bold mb-2 sm:text-3xl">Olá! 👋</h2>
          <p className="text-sm text-muted-foreground sm:text-base">Bem-vindo ao seu painel de controle</p>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:mb-10">
          <Link href="/dashboard/appointments" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#72C1F2] to-[#4E98D9] opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold sm:text-base">Agendamentos</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-[#72C1F2] to-[#4E98D9] p-2.5 sm:p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold sm:text-4xl" style={{color: '#4E98D9'}}>{stats.total}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 sm:text-sm">
                  <span className="text-xs">→</span> Ver todos os agendamentos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/customers" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#566D8C] to-[#4E98D9] opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold sm:text-base">Clientes</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-[#566D8C] to-[#4E98D9] p-2.5 sm:p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold sm:text-4xl" style={{color: '#566D8C'}}>{stats.customers}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 sm:text-sm">
                  <span className="text-xs">→</span> Gerenciar clientes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/conversations" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#79D0F2] to-[#72C1F2] opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold sm:text-base">Conversas</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-[#79D0F2] to-[#72C1F2] p-2.5 sm:p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold sm:text-4xl" style={{color: '#79D0F2'}}>{stats.conversations}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 sm:text-sm">
                  <span className="text-xs">→</span> Ver conversas ativas
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 lg:mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Estatísticas</h2>
            <span className="text-xs text-muted-foreground sm:text-sm">Atualizado em tempo real</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">Total</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-[#4E98D9] to-[#566D8C] p-2 sm:p-2.5 shadow-md">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold sm:text-4xl" style={{color: '#4E98D9'}}>{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos totais
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">Concluídos</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 sm:p-2.5 shadow-md">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold sm:text-4xl text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {completionPercentage}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">Pendentes</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-[#72C1F2] to-[#79D0F2] p-2 sm:p-2.5 shadow-md">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold sm:text-4xl" style={{color: '#72C1F2'}}>{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando atendimento
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">Cancelados</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-2 sm:p-2.5 shadow-md">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold sm:text-4xl text-red-600">{stats.cancelled}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos cancelados
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
