'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AppointmentDetailPage({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [appointment, setAppointment] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const loadAppointmentDetails = useCallback(async () => {
    try {
      const appointmentId = resolvedParams?.id

      // Busca agendamento
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) {
        return
      }

      setAppointment(appointmentData)

      // Busca cliente
      if (appointmentData.customer_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', appointmentData.customer_id)
          .single()

        if (!customerError) {
          setCustomer(customerData)
        }
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [resolvedParams?.id, supabase])

  useEffect(() => {
    if (resolvedParams?.id) {
      loadAppointmentDetails()
    }
  }, [resolvedParams?.id, loadAppointmentDetails])

  const updateStatus = async (newStatus) => {
    if (!appointment) return

    setUpdating(true)
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id)
        .select()

      if (error) {
        alert(`Erro ao atualizar: ${error.message}`)
        return
      }
      
      if (!data || data.length === 0) {
        alert('Nenhum registro foi atualizado. Verifique as permissões no Supabase.')
        return
      }
      
      // Atualiza o estado local
      setAppointment({ ...appointment, status: newStatus })
      
      // Mostra mensagem de sucesso
      alert('Status atualizado com sucesso!')
      
      // Aguarda 1 segundo e volta para a lista
      setTimeout(() => {
        router.push('/dashboard/appointments')
      }, 1500)
    } catch (err) {
      alert(`Erro inesperado: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Agendamento não encontrado</p>
          <Button asChild>
            <Link href="/dashboard/appointments">Voltar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6">
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center gap-3 lg:mb-8 lg:gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-accent">
            <Link href="/dashboard/appointments">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{color: '#72C1F2'}}>
              Detalhes do Agendamento
            </h1>
            <p className="text-xs text-muted-foreground mt-1 sm:text-sm">Visualize e gerencie o agendamento</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Informações do Cliente */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm lg:sticky lg:top-6">
              <CardHeader className="border-b pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 sm:space-y-5 sm:pt-6">
                {customer ? (
                  <>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #4E98D9, #72C1F2)'}}>
                        <User className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4 sm:space-y-3 sm:pt-5">
                      {customer.email && (
                        <div className="flex items-center gap-2 rounded-lg p-2.5 sm:gap-3 sm:p-3" style={{backgroundColor: '#E8F4FC'}}>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{backgroundColor: '#4E98D9'}}>
                            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="break-all text-xs font-medium sm:text-sm" style={{color: '#1e3a5f'}}>{customer.email}</span>
                        </div>
                      )}

                      {customer.phone && (
                        <div className="flex items-center gap-2 rounded-lg p-2.5 sm:gap-3 sm:p-3" style={{backgroundColor: '#E8F4FC'}}>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{backgroundColor: '#72C1F2'}}>
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="text-xs font-medium sm:text-sm" style={{color: '#1e3a5f'}}>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Cliente não encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Informações */}
            <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-b pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Informações do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 sm:space-y-5 sm:pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: '#72C1F2'}} />
                  <div>
                    <p className="text-xs text-muted-foreground sm:text-sm">Data</p>
                    <p className="font-semibold text-base sm:text-lg">{formatDate(appointment.start_time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: '#79D0F2'}} />
                  <div>
                    <p className="text-xs text-muted-foreground sm:text-sm">Horário</p>
                    <p className="font-semibold text-base sm:text-lg">
                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2 sm:text-sm">Status Atual</p>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm ${getStatusColor(appointment.status)}`}>
                    {appointment.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                    {appointment.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                    {appointment.status === 'pending' && <AlertCircle className="h-4 w-4" />}
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-b pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                {appointment.status !== 'completed' && (
                  <Button
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {updating ? 'Atualizando...' : 'Marcar como Concluído'}
                  </Button>
                )}

                {appointment.status !== 'cancelled' && (
                  <Button
                    onClick={() => updateStatus('cancelled')}
                    disabled={updating}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {updating ? 'Atualizando...' : 'Cancelar Agendamento'}
                  </Button>
                )}

                {appointment.status === 'completed' && (
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/30">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
                    <p className="font-semibold text-green-700 dark:text-green-300">Agendamento Concluído</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Este agendamento foi finalizado com sucesso</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
