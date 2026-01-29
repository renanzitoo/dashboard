'use client'

import { use, useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Phone, Bot, MessageSquare } from 'lucide-react'

export default function ConversationDetailPage({ params }) {
  const resolvedParams = use(params)
  const [conversation, setConversation] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const lastCheckRef = useRef({
    messages: Date.now(),
    conversations: Date.now(),
    customers: Date.now()
  })

  // Webhook polling
  const checkWebhooks = useCallback(async () => {
    if (!resolvedParams?.id) return

    try {
      const tables = ['messages', 'conversations', 'customers']
      
      for (const table of tables) {
        const response = await fetch(
          `/api/webhook?table=${table}&since=${lastCheckRef.current[table]}`
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.hasChanges) {
            console.log(`🔄 Webhook - ${table} foi modificado`)
            lastCheckRef.current[table] = Date.now()
            
            if (table === 'messages') {
              await loadMessages()
            } else if (table === 'conversations') {
              await loadConversation()
            } else if (table === 'customers' && customer?.id) {
              await loadCustomer(customer.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao checar webhooks:', error)
    }
  }, [resolvedParams?.id, customer?.id])

  useEffect(() => {
    if (resolvedParams?.id) {
      loadConversationDetails()
      
      // Polling para webhooks a cada 2 segundos
      const interval = setInterval(checkWebhooks, 2000)
      
      return () => {
        clearInterval(interval)
      }
    }
  }, [resolvedParams?.id, checkWebhooks])

  const loadConversation = async () => {
    try {
      const conversationId = resolvedParams?.id
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError) {
        console.error('Erro ao carregar conversa:', convError)
        return
      }

      console.log('Conversa recarregada:', convData)
      setConversation(convData)
    } catch (err) {
      console.error('Erro ao recarregar conversa:', err)
    }
  }

  const loadCustomer = async (customerId) => {
    try {
      const { data: customerData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (custError) {
        console.error('Erro ao carregar cliente:', custError)
        return
      }

      console.log('Cliente recarregado:', customerData)
      setCustomer(customerData)
    } catch (err) {
      console.error('Erro ao recarregar cliente:', err)
    }
  }

  const loadMessages = async () => {
    try {
      const conversationId = resolvedParams?.id
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Erro ao carregar mensagens:', messagesError)
        return
      }

      console.log('Mensagens recarregadas:', messagesData)
      setMessages(messagesData || [])
    } catch (err) {
      console.error('Erro ao recarregar mensagens:', err)
    }
  }

  const loadConversationDetails = async () => {
    try {
      const conversationId = resolvedParams?.id

      // Busca conversa
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError) {
        console.error('Erro ao carregar conversa:', convError)
        console.error('Detalhes do erro:', convError.message)
        return
      }

      console.log('Conversa carregada:', convData)
      setConversation(convData)

      // Busca cliente
      const { data: customerData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', convData.customer_id)
        .single()

      if (custError) {
        console.error('Erro ao carregar cliente:', custError)
        console.error('Detalhes do erro:', custError.message)
      } else {
        console.log('Cliente carregado:', customerData)
        setCustomer(customerData)
      }

      // Busca mensagens
      await loadMessages()
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

  if (!conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Conversa não encontrada</p>
          <Button asChild>
            <Link href="/dashboard/conversations">Voltar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <Link href="/dashboard/conversations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
              Detalhes da Conversa
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Visualize e acompanhe a conversa</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm sticky top-6">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {customer ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t pt-5">

                    {customer.email && (
                      <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="break-all text-sm">{customer.email}</span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    </div>

                    <div className="space-y-3 border-t pt-5">
                      <p className="text-sm font-medium text-muted-foreground">Status da Conversa</p>
                      <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ${
                        conversation.status === 'open' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${
                          conversation.status === 'open' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></span>
                        {conversation.status === 'open' ? 'Aberta' : 'Fechada'}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                      <p className="mt-1 text-sm font-medium">{formatDate(conversation.created_at)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Cliente não encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/70 shadow-lg backdrop-blur-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="flex min-h-[400px] items-center justify-center p-6">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 p-6 max-h-[600px] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === 'bot' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-slate-600 dark:from-gray-600 dark:to-slate-700 shadow-lg">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                            message.sender === 'bot'
                              ? 'bg-gradient-to-br from-slate-700 to-gray-800 text-gray-100 dark:from-gray-800 dark:to-slate-800 dark:text-gray-100'
                              : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`mt-2 text-xs ${
                            message.sender === 'bot' ? 'text-gray-300 dark:text-gray-400' : 'text-white/80'
                          }`}>
                            {formatDate(message.created_at)}
                          </p>
                        </div>

                        {message.sender === 'customer' && (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
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
