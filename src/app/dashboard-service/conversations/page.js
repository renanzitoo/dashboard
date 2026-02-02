'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from '@/lib/hooks/useWebhookPolling'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, User, CheckCircle, XCircle } from 'lucide-react'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [customers, setCustomers] = useState({})
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const loadConversations = useCallback(async () => {
    try {

      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('started_at', { ascending: false })

      if (convError) {
        return
      }

      setConversations(conversationsData || [])

      const { data: customersData, error: custError } = await supabase
        .from('customers')
        .select('*')

      if (custError) {
        return
      }

      const customersMap = {}
      customersData?.forEach(customer => {
        customersMap[customer.id] = customer
      })

      setCustomers(customersMap)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useRealtimeSubscription({
    table: 'conversations',
    onUpdate: () => loadConversations()
  })

  useRealtimeSubscription({
    table: 'customers',
    onUpdate: () => loadConversations()
  })

  const closeOldConversations = useCallback(async () => {
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: oldConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id, started_at')
        .eq('status', 'open')
        .lt('started_at', twentyFourHoursAgo.toISOString())

      if (fetchError) {
        return
      }

      if (oldConversations && oldConversations.length > 0) {

        for (const conv of oldConversations) {
          await supabase
            .from('conversations')
            .update({ status: 'closed' })
            .eq('id', conv.id)
        }

        loadConversations()
      }
    } catch (error) {
    }
  }, [supabase, loadConversations])

  useEffect(() => {
    loadConversations()

    closeOldConversations()

    const closeInterval = setInterval(closeOldConversations, 2 * 60 * 60 * 1000)

    return () => {
      clearInterval(closeInterval)
    }
  }, [loadConversations, closeOldConversations])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Conversas</h1>
          </div>
          <p className="text-white/80">Acompanhe todas as conversas</p>
        </div>
      </div>
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl font-bold sm:text-2xl">
          {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
        </h2>
      </div>

        {conversations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {conversations.map((conversation) => {
              const customer = customers[conversation.customer_id]
              
              return (
                <Link key={conversation.id} href={`/dashboard-service/conversations/${conversation.id}`}>
                  <Card className="group cursor-pointer border-0 bg-card/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-3 sm:gap-4">
                          <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110" style={{background: 'linear-gradient(135deg, #79D0F2, #72C1F2)'}}>
                            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{color: '#4E98D9'}} />
                              <span className="font-semibold text-sm sm:text-base truncate">
                                {customer?.name || 'Cliente não encontrado'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground sm:text-sm" suppressHydrationWarning>
                              {formatDate(conversation.started_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {conversation.status === 'open' ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300 sm:px-3 sm:text-sm">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              Aberta
                            </span>
                          ) : conversation.status === 'in_progress' ? (
                            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300 sm:px-3 sm:text-sm">
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                              Em Andamento
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:px-3 sm:text-sm">
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              Fechada
                            </span>
                          )}
                        </div>
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
