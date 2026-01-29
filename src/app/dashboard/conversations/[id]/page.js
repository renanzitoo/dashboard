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
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <Link href="/dashboard/conversations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold" style={{color: '#79D0F2'}}>
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
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #4E98D9, #72C1F2)'}}>
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t pt-5">

                    {customer.email && (
                      <div className="flex items-center gap-3 rounded-lg p-3" style={{backgroundColor: '#E8F4FC'}}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{backgroundColor: '#4E98D9'}}>
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <span className="break-all text-sm font-medium" style={{color: '#1e3a5f'}}>{customer.email}</span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center gap-3 rounded-lg p-3" style={{backgroundColor: '#E8F4FC'}}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{backgroundColor: '#72C1F2'}}>
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium" style={{color: '#1e3a5f'}}>{customer.phone}</span>
                      </div>
                    )}
                    </div>

                    <div className="space-y-3 border-t pt-5">
                      <p className="text-sm font-medium text-muted-foreground">Status da Conversa</p>
                      <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ${
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
                  <MessageSquare className="h-5 w-5" style={{color: '#79D0F2'}} />
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
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #566D8C, #4E98D9)'}}>
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                            message.sender === 'bot'
                              ? 'text-white'
                              : 'text-white shadow-lg'
                          }`}
                          style={message.sender === 'bot' 
                            ? {background: 'linear-gradient(135deg, #566D8C, #4E98D9)'}
                            : {background: 'linear-gradient(135deg, #72C1F2, #4E98D9)'}
                          }
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="mt-2 text-xs text-white/70">
                            {formatDate(message.created_at)}
                          </p>
                        </div>

                        {message.sender === 'customer' && (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg" style={{background: 'linear-gradient(135deg, #4E98D9, #72C1F2)'}}>
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
