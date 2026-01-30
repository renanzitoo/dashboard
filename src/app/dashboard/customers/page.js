'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, User } from 'lucide-react'

export default function CustomersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef(Date.now())

  const loadCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return
      }

      setItems(data || [])
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkWebhook = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhook?table=customers&since=${lastCheckRef.current}`)
      const data = await response.json()
      
      if (data.hasChanges) {
        lastCheckRef.current = data.timestamp
        loadCustomers()
      }
    } catch (error) {
    }
  }, [loadCustomers])

  useEffect(() => {
    loadCustomers()

    // Webhook polling a cada 2 segundos
    const interval = setInterval(checkWebhook, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [loadCustomers, checkWebhook])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
    <div className="min-h-screen pb-6">
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl" style={{color: '#4E98D9'}}>
            Clientes
          </h1>
          <p className="text-xs text-muted-foreground mt-1 sm:text-sm">Gerencie sua base de clientes</p>
        </div>
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">
            {items.length} {items.length === 1 ? 'cliente' : 'clientes'}
          </h2>
        </div>

        {items.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((customer) => (
              <Card key={customer.id} className="group border-0 bg-card/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110" style={{background: 'linear-gradient(135deg, #4E98D9, #72C1F2)'}}>
                      <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{customer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Cliente desde {formatDate(customer.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t pt-4">
                    {customer.email && (
                      <div className="flex items-center gap-2 sm:gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="truncate flex-1 text-xs sm:text-sm">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 sm:gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs sm:text-sm">{customer.phone}</span>
                      </div>
                    )}
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
