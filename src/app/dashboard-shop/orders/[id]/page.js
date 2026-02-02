'use client'

import { useEffect, useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Package, User, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react'

export default function OrderDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (id) {
      loadOrderDetails()
    }
  }, [id])

  const loadOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          order_items(*),
          payments(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

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
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800', icon: Package },
      pending_payment: { label: 'Aguardando Pagamento', className: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
      paid: { label: 'Pago', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      canceled: { label: 'Cancelado', className: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-800', icon: XCircle },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: Package }
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando detalhes do pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Pedido não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Detalhes do Pedido</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">ID: {order.id}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliente
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{order.customer?.name || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">{order.customer?.phone || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data do Pedido
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold" suppressHydrationWarning>{formatDate(order.created_at)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity} × {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{formatCurrency(item.total_price)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="font-semibold text-lg">Total</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(order.total_amount)}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item no pedido
            </div>
          )}
        </CardContent>
      </Card>

      
      {order.payments && order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div key={payment.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Provedor: {payment.provider}</div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status === 'paid' ? 'Pago' :
                       payment.status === 'pending' ? 'Pendente' :
                       payment.status === 'failed' ? 'Falhou' :
                       payment.status === 'refunded' ? 'Reembolsado' :
                       payment.status}
                    </span>
                  </div>
                  {payment.external_payment_id && (
                    <div className="text-sm text-muted-foreground">
                      ID Externo: {payment.external_payment_id}
                    </div>
                  )}
                  {payment.payment_url && (
                    <a
                      href={payment.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Ver pagamento →
                    </a>
                  )}
                  {payment.paid_at && (
                    <div className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
                      Pago em: {formatDate(payment.paid_at)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
