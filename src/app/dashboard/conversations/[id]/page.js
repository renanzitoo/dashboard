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
  const messagesEndRef = useRef(null)
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

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const loadConversation = async () => {
    try {
      const conversationId = resolvedParams?.id
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError) {
        return
      }

      setConversation(convData)
    } catch (err) {
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
        return
      }

      setCustomer(customerData)
    } catch (err) {
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
        return
      }

      setMessages(messagesData || [])
    } catch (err) {
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
        return
      }

      setConversation(convData)

      // Busca cliente
      const { data: customerData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', convData.customer_id)
        .single()

      if (custError) {
      } else {
        setCustomer(customerData)
      }

      // Busca mensagens
      await loadMessages()
    } catch (err) {
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
    <div className="min-h-screen pb-6">
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center gap-3 lg:mb-8 lg:gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <Link href="/dashboard/conversations">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{color: '#79D0F2'}}>
              Detalhes da Conversa
            </h1>
            <p className="text-xs text-muted-foreground mt-1 sm:text-sm">Visualize e acompanhe a conversa</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Customer Info Sidebar */}
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

                    <div className="space-y-3 border-t pt-4 sm:pt-5">
                      <p className="text-xs font-medium text-muted-foreground sm:text-sm">Status da Conversa</p>
                      <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm sm:px-4 sm:py-2 sm:text-sm ${
                        conversation.status === 'open' 
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                      style={conversation.status === 'open' ? {backgroundColor: '#10b981'} : {}}
                      >
                        <span className={`h-2 w-2 rounded-full ${
                          conversation.status === 'open' ? 'bg-white' : 'bg-gray-500'
                        }`}></span>
                        {conversation.status === 'open' ? 'Aberta' : 'Fechada'}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground sm:text-sm">Criada em</p>
                      <p className="mt-1 text-xs font-medium sm:text-sm">{formatDate(conversation.created_at)}</p>
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
              <CardHeader className="border-b pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{color: '#79D0F2'}} />
                  Mensagens ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="flex min-h-[300px] items-center justify-center p-6 sm:min-h-[400px]">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50 sm:h-12 sm:w-12" />
                      <p className="text-sm text-muted-foreground sm:text-base">Nenhuma mensagem ainda</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 max-h-[500px] overflow-y-auto sm:space-y-6 sm:p-6 sm:max-h-[600px]">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${
                          message.sender === 'bot' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #566D8C, #4E98D9)'}}>
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 shadow-md sm:px-5 sm:py-3 ${
                            message.sender === 'bot'
                              ? 'text-white'
                              : 'text-white shadow-lg'
                          }`}
                          style={message.sender === 'bot' 
                            ? {background: 'linear-gradient(135deg, #566D8C, #4E98D9)'}
                            : {background: 'linear-gradient(135deg, #72C1F2, #4E98D9)'}
                          }
                        >
                          <p className="text-xs leading-relaxed sm:text-sm">{message.content}</p>
                          <p className="mt-1.5 text-xs text-white/70 sm:mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>

                    <div ref={messagesEndRef} />
                        {message.sender === 'customer' && (
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #4E98D9, #72C1F2)'}}>
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
