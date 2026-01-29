'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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

  const loadStats = useCallback(async () => {
    try {
      // Appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status')
        .order('created_at', { ascending: false })

      if (appointmentsError) {
        console.error('Erro ao carregar estatísticas de agendamentos:', appointmentsError)
      }

      // Customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')

      if (customersError) {
        console.error('Erro ao carregar estatísticas de clientes:', customersError)
      }

      // Conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')

      if (conversationsError) {
        console.error('Erro ao carregar estatísticas de conversas:', conversationsError)
      }

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
      console.error('Erro ao carregar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadStats()
    
    // Real-time subscriptions for all tables
    const appointmentsChannel = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' }, 
        (payload) => {
          console.log('🔄 Realtime - Agendamento atualizado (dashboard):', payload)
          loadStats()
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão (appointments - dashboard):', status)
      })

    const customersChannel = supabase
      .channel('customers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' }, 
        (payload) => {
          console.log('🔄 Realtime - Cliente atualizado (dashboard):', payload)
          loadStats()
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão (customers - dashboard):', status)
      })

    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        (payload) => {
          console.log('🔄 Realtime - Conversa atualizada (dashboard):', payload)
          loadStats()
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão (conversations - dashboard):', status)
      })

    return () => {
      supabase.removeChannel(appointmentsChannel)
      supabase.removeChannel(customersChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [loadStats, supabase])

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
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Olá! 👋</h2>
          <p className="text-muted-foreground">Bem-vindo ao seu painel de controle</p>
        </div>

        {/* Navigation Cards */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/appointments" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold">Agendamentos</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-br from-gray-700 to-slate-800 dark:from-gray-300 dark:to-slate-400 bg-clip-text text-transparent">{stats.total}</div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-xs">→</span> Ver todos os agendamentos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/customers" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold">Clientes</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-br from-emerald-700 to-teal-800 dark:from-emerald-300 dark:to-teal-400 bg-clip-text text-transparent">{stats.customers}</div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-xs">→</span> Gerenciar clientes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/conversations" className="block group">
            <Card className="relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold">Conversas</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-br from-amber-700 to-orange-800 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">{stats.conversations}</div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-xs">→</span> Ver conversas ativas
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Estatísticas</h2>
            <span className="text-sm text-muted-foreground">Atualizado em tempo real</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 dark:from-gray-600 dark:to-slate-700 p-2.5 shadow-md">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos totais
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-2.5 shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {completionPercentage}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 dark:from-slate-600 dark:to-gray-700 p-2.5 shadow-md">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando atendimento
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancelados</CardTitle>
                <div className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-700 p-2.5 shadow-md">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold text-red-600">{stats.cancelled}</div>
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
