'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AppointmentsPage() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef(Date.now())

  const loadAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, status, customer_id, created_at')
        .order('start_time', { ascending: false })

      if (error) {
        return
      }

      setItems(data || [])
      setFilteredItems(data || [])
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkWebhook = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhook?table=appointments&since=${lastCheckRef.current}`)
      const data = await response.json()
      
      if (data.hasChanges) {
        lastCheckRef.current = data.timestamp
        loadAppointments()
      }
    } catch (error) {
    }
  }, [loadAppointments])

  useEffect(() => {
    loadAppointments()

    // Webhook polling a cada 2 segundos
    const interval = setInterval(checkWebhook, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [loadAppointments, checkWebhook])

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
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{color: '#72C1F2'}}>
            Agendamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie todos os agendamentos</p>
        </div>
        {/* Filters */}
        <Card className="mb-8 border-0 bg-card/70 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
              <span className="text-xs text-muted-foreground">{filteredItems.length} resultados</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
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
              <label className="text-sm font-medium">Data</label>
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
                }}
                style={{backgroundColor: '#72C1F2'}}
                className="h-10 w-full text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredItems.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((appointment) => (
              <Card key={appointment.id} className="group border-0 bg-card/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="mt-1">{getStatusIcon(appointment.status)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="h-4 w-4" style={{color: '#72C1F2'}} />
                        <span className="font-semibold">{formatDate(appointment.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" style={{color: '#79D0F2'}} />
                        <span>
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
