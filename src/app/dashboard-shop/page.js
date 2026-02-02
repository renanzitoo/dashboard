'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, DollarSign, Users, CheckCircle, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'

export default function ShopDashboardPage() {
  const [stats, setStats] = useState({
    orders: 0,
    ordersPaid: 0,
    ordersPending: 0,
    products: 0,
    productsActive: 0,
    customers: 0,
    totalRevenue: 0,
    conversations: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const supabase = createClient()

      const { data: orders } = await supabase.from('orders').select('id, status, total_amount')
      const { data: products } = await supabase.from('products').select('id, active')
      const { data: customers } = await supabase.from('customers').select('id')
      const { data: conversations } = await supabase.from('conversations').select('id')

      const ordersCount = orders?.length || 0
      const ordersPaid = orders?.filter(o => o.status === 'paid').length || 0
      const ordersPending = orders?.filter(o => o.status === 'pending_payment').length || 0
      const productsCount = products?.length || 0
      const productsActive = products?.filter(p => p.active).length || 0
      const totalRevenue = orders?.filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0

      setStats({
        orders: ordersCount,
        ordersPaid,
        ordersPending,
        products: productsCount,
        productsActive,
        customers: customers?.length || 0,
        totalRevenue,
        conversations: conversations?.length || 0,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    const fetchStats = async () => {
      if (mounted) {
        await loadStats()
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
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
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard da Loja</h1>
          </div>
          <p className="text-white/80">Gerencie pedidos, produtos e vendas em tempo real</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Receita Total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-white/60 mt-1">De pedidos pagos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Total de Pedidos</p>
                <p className="text-2xl font-bold mt-1">{stats.orders}</p>
                <p className="text-xs text-white/60 mt-1">{stats.ordersPaid} pagos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Produtos</p>
                <p className="text-2xl font-bold mt-1">{stats.products}</p>
                <p className="text-xs text-white/60 mt-1">{stats.productsActive} ativos</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Clientes</p>
                <p className="text-2xl font-bold mt-1">{stats.customers}</p>
                <p className="text-xs text-white/60 mt-1">Cadastrados</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Acesso Rápido
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard-shop/orders" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-green-500/50 hover:bg-green-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pedidos</p>
                    <p className="text-xs text-muted-foreground">{stats.orders} total</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard-shop/products" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-purple-500/50 hover:bg-purple-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Produtos</p>
                    <p className="text-xs text-muted-foreground">{stats.products} cadastrados</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard-shop/customers" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-orange-500/50 hover:bg-orange-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Clientes</p>
                    <p className="text-xs text-muted-foreground">{stats.customers} clientes</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard-shop/conversations" className="group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Conversas</p>
                    <p className="text-xs text-muted-foreground">{stats.conversations} ativas</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pedidos Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.ordersPaid}</p>
                <p className="text-sm text-muted-foreground">de {stats.orders} pedidos</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            {stats.orders > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${(stats.ordersPaid / stats.orders) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.ordersPaid / stats.orders) * 100)}% de conversão
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-yellow-500" />
              Aguardando Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">{stats.ordersPending}</p>
                <p className="text-sm text-muted-foreground">pedidos pendentes</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            {stats.ordersPending > 0 && (
              <Link 
                href="/dashboard-shop/orders?status=pending_payment"
                className="mt-4 flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Ver pedidos pendentes
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="pt-4 pb-2 text-center">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Oxyon AI. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
