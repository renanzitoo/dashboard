'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShoppingCart, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef(0)

  const loadOrders = useCallback(async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          order_items(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const total = ordersData?.length || 0
      const pending = ordersData?.filter(o => o.status === 'pending_payment').length || 0
      const paid = ordersData?.filter(o => o.status === 'paid').length || 0
      const totalRevenue = ordersData?.filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0

      setOrders(ordersData || [])
      setStats({ total, pending, paid, totalRevenue })
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkWebhooks = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhook?table=orders&since=${lastCheckRef.current}`)
      const data = await response.json()
      
      if (data.hasChanges) {
        lastCheckRef.current = data.timestamp
        loadOrders()
      }
    } catch (error) {
    }
  }, [loadOrders])

  useEffect(() => {
    loadOrders()
    const interval = setInterval(checkWebhooks, 2000)
    return () => clearInterval(interval)
  }, [loadOrders, checkWebhooks])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
      pending_payment: { label: 'Aguardando Pagamento', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Pago', className: 'bg-green-100 text-green-800' },
      canceled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-800' },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Pedidos</h1>
          </div>
          <p className="text-white/80">Gerencie todos os pedidos da loja</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Total de Pedidos</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-white/60 mt-1">Todos os pedidos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Aguardando</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
                <p className="text-xs text-white/60 mt-1">Pagamento pendente</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Pedidos Pagos</p>
                <p className="text-2xl font-bold mt-1">{stats.paid}</p>
                <p className="text-xs text-white/60 mt-1">Confirmados</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Receita Total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-white/60 mt-1">Pedidos pagos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{order.customer?.phone || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.order_items?.length || 0}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard-shop/orders/${order.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver detalhes
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
