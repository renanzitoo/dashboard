'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, DollarSign, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    avgPrice: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const lastCheckRef = useRef(0)

  const loadProducts = useCallback(async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const total = productsData?.length || 0
      const active = productsData?.filter(p => p.active).length || 0
      const inactive = total - active
      const avgPrice = total > 0
        ? productsData.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / total
        : 0

      setProducts(productsData || [])
      setStats({ total, active, inactive, avgPrice })
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkWebhooks = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhook?table=products&since=${lastCheckRef.current}`)
      const data = await response.json()
      
      if (data.hasChanges) {
        lastCheckRef.current = data.timestamp
        loadProducts()
      }
    } catch (error) {
    }
  }, [loadProducts])

  useEffect(() => {
    loadProducts()
    const interval = setInterval(checkWebhooks, 2000)
    return () => clearInterval(interval)
  }, [loadProducts, checkWebhooks])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
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
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Produtos</h1>
          </div>
          <p className="text-white/80">Gerencie o catálogo de produtos da loja</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Total de Produtos</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-white/60 mt-1">Catálogo completo</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Produtos Ativos</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
                <p className="text-xs text-white/60 mt-1">À venda</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Produtos Inativos</p>
                <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
                <p className="text-xs text-white/60 mt-1">Fora de venda</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Preço Médio</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.avgPrice)}</p>
                <p className="text-xs text-white/60 mt-1">Ticket médio</p>
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
          <CardTitle>Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">
                        {product.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.external_id && (
                          <div className="text-xs text-muted-foreground">
                            Ext: {product.external_id}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {product.description || '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
                        {product.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard-shop/products/${product.id}`}
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
