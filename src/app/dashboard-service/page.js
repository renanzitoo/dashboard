'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, MessageSquare, CheckCircle, TrendingUp, ArrowRight, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    appointments: 0,
    appointmentsToday: 0,
    appointmentsPending: 0,
    customers: 0,
    conversations: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const supabase = createClient()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, start_time, status')

      const { data: customers } = await supabase
        .from('customers')
        .select('id')

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')

      const appointmentsCount = appointments?.length || 0
      const appointmentsToday = appointments?.filter(a => {
        const startTime = new Date(a.start_time)
        return startTime >= today && startTime < tomorrow
      }).length || 0
      const appointmentsPending = appointments?.filter(a => a.status === 'pending').length || 0

      setStats({
        appointments: appointmentsCount,
        appointmentsToday,
        appointmentsPending,
        customers: customers?.length || 0,
        conversations: conversations?.length || 0,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    const fetchStats = async () => {
      if (mounted) {
        await loadStats()
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard de Atendimentos</h1>
          </div>
          <p className="text-white/80">Gerencie agendamentos e clientes em tempo real</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Total de Agendamentos</p>
                <p className="text-2xl font-bold mt-1">{stats.appointments}</p>
                <p className="text-xs text-white/60 mt-1">Todos os tempos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Hoje</p>
                <p className="text-2xl font-bold mt-1">{stats.appointmentsToday}</p>
                <p className="text-xs text-white/60 mt-1">Agendamentos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Clientes</p>
                <p className="text-2xl font-bold mt-1">{stats.customers}</p>
                <p className="text-xs text-white/60 mt-1">Cadastrados</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Conversas</p>
                <p className="text-2xl font-bold mt-1">{stats.conversations}</p>
                <p className="text-xs text-white/60 mt-1">Ativas</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Acesso Rápido
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard-service/appointments" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Agendamentos</p>
                    <p className="text-xs text-muted-foreground">{stats.appointments} total</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard-service/customers" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Clientes</p>
                    <p className="text-xs text-muted-foreground">{stats.customers} clientes</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard-service/conversations" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-violet-500/50 hover:bg-violet-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Conversas</p>
                    <p className="text-xs text-muted-foreground">{stats.conversations} ativas</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-500" />
              Agendamentos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-cyan-600">{stats.appointmentsToday}</p>
                <p className="text-sm text-muted-foreground">de {stats.appointments} agendamentos</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-cyan-500" />
              </div>
            </div>
            {stats.appointments > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                    style={{ width: `${(stats.appointmentsToday / stats.appointments) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.appointmentsToday / stats.appointments) * 100)}% dos agendamentos
                </p>
              </div>
            )}
            {stats.appointmentsToday > 0 && (
              <Link 
                href="/dashboard-service/appointments?date=today"
                className="mt-4 flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                Ver agendamentos de hoje
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">{stats.appointmentsPending}</p>
                <p className="text-sm text-muted-foreground">de {stats.appointments} agendamentos</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            {stats.appointments > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(stats.appointmentsPending / stats.appointments) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.appointmentsPending / stats.appointments) * 100)}% pendentes
                </p>
              </div>
            )}
            {stats.appointmentsPending > 0 && (
              <Link 
                href="/dashboard-service/appointments?status=pending"
                className="mt-4 flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Ver pendentes
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="pt-4 pb-2 text-center">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Oxyon AI. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
