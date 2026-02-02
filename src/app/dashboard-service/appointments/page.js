'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from '@/lib/hooks/useWebhookPolling'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react'

export default function AppointmentsPage() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [customers, setCustomers] = useState({})
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showPast, setShowPast] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const loadAppointments = useCallback(async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let query = supabase
        .from('appointments')
        .select('id, start_time, end_time, status, customer_id, created_at')

      if (!showPast) {
        query = query.gte('start_time', today.toISOString())
      }
      
      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        return
      }

      setItems(data || [])
      setFilteredItems(data || [])

      const { data: customersData, error: custError } = await supabase
        .from('customers')
        .select('*')

      if (!custError && customersData) {

        const customersMap = {}
        customersData.forEach(customer => {
          customersMap[customer.id] = customer
        })
        setCustomers(customersMap)
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useRealtimeSubscription({
    table: 'appointments',
    onUpdate: () => loadAppointments()
  })

  useRealtimeSubscription({
    table: 'customers',
    onUpdate: () => loadAppointments()
  })

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    loadAppointments()
  }, [showPast, loadAppointments])

  useEffect(() => {
    let filtered = [...items]
    
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }
    
    if (dateFilter) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.start_time).toISOString().split('T')[0]
        return itemDate === dateFilter
      })
    }
    
    setFilteredItems(filtered)
  }, [items, statusFilter, dateFilter])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5" style={{color: '#72C1F2'}} />
      default:
        return <Clock className="h-5 w-5" style={{color: '#79D0F2'}} />
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      'in-progress': 'Em Andamento',
      'no-show': 'Não Compareceu'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
            <h1 className="text-2xl font-bold sm:text-3xl">Agendamentos</h1>
          </div>
          <p className="text-white/80">Gerencie todos os agendamentos</p>
        </div>
      </div>

        <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold sm:text-lg">Filtros</CardTitle>
              <span className="text-xs text-muted-foreground">{filteredItems.length} resultados</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <label className="text-xs font-medium sm:text-sm">Período</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="showPast"
                    checked={!showPast}
                    onChange={() => setShowPast(false)}
                    className="h-4 w-4 text-primary cursor-pointer"
                    style={{accentColor: '#72C1F2'}}
                  />
                  <span className="text-sm">Apenas futuros</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="showPast"
                    checked={showPast}
                    onChange={() => setShowPast(true)}
                    className="h-4 w-4 text-primary cursor-pointer"
                    style={{accentColor: '#72C1F2'}}
                  />
                  <span className="text-sm">Incluir anteriores</span>
                </label>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium sm:text-sm">Status</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium sm:text-sm">Data</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setStatusFilter('')
                    setDateFilter('')
                    setShowPast(false)
                  }}
                  style={{backgroundColor: '#72C1F2'}}
                  className="h-10 w-full text-sm text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl sm:text-base"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredItems.map((appointment) => {
              const customer = customers[appointment.customer_id]
              
              return (
              <Link key={appointment.id} href={`/dashboard-service/appointments/${appointment.id}`}>
              <Card className="group cursor-pointer border-0 bg-card/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                <CardContent className="flex flex-col gap-4 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-3 sm:gap-4">
                    <div className="mt-1 flex-shrink-0">{getStatusIcon(appointment.status)}</div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{color: '#4E98D9'}} />
                        <span className="font-semibold text-sm sm:text-base truncate">
                          {customer?.name || 'Cliente não encontrado'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{color: '#72C1F2'}} />
                        <span className="font-medium text-sm sm:text-base" suppressHydrationWarning>{formatDate(appointment.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{color: '#79D0F2'}} />
                        <span suppressHydrationWarning>
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm sm:px-4 sm:py-1.5 sm:text-sm ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            )
            })}
          </div>
        )}

      <footer className="pt-4 pb-2 text-center">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Oxyon AI. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
