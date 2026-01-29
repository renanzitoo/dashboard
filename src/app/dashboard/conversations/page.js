'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, User, CheckCircle, XCircle } from 'lucide-react'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [customers, setCustomers] = useState({})
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef({ conversations: Date.now(), customers: Date.now() })

  const loadConversations = useCallback(async () => {
    try {
      // Busca conversas
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('started_at', { ascending: false })

      if (convError) {
        return
      }

      setConversations(conversationsData || [])

      // Busca todos os clientes
      const { data: customersData, error: custError } = await supabase
        .from('customers')
        .select('*')

      if (custError) {
        return
      }

      // Cria mapa de clientes para acesso rápido
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

  const checkWebhooks = useCallback(async () => {
    try {
      const tables = ['conversations', 'customers']
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
        loadConversations()
      }
    } catch (error) {
    }
  }, [loadConversations])

  useEffect(() => {
    loadConversations()

    // Webhook polling a cada 2 segundos
    const interval = setInterval(checkWebhooks, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [loadConversations, checkWebhooks])

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
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{color: '#79D0F2'}}>
            Conversas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe todas as conversas</p>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
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
          <div className="grid gap-4">
            {conversations.map((conversation) => {
              const customer = customers[conversation.customer_id]
              
              return (
                <Link key={conversation.id} href={`/dashboard/conversations/${conversation.id}`}>
                  <Card className="group cursor-pointer border-0 bg-card/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110" style={{background: 'linear-gradient(135deg, #79D0F2, #72C1F2)'}}>
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" style={{color: '#4E98D9'}} />
                            <span className="font-semibold truncate">
                              {customer?.name || 'Cliente não encontrado'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(conversation.started_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {conversation.status === 'open' ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            Aberta
                          </span>
                        ) : conversation.status === 'in_progress' ? (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <MessageSquare className="h-4 w-4" />
                            Em Andamento
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <XCircle className="h-4 w-4" />
                            Fechada
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
