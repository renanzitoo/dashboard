'use client'

import { useEffect, useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Package, DollarSign, Calendar, CheckCircle, XCircle, Hash } from 'lucide-react'

export default function ProductDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (id) {
      loadProductDetails()
    }
  }, [id])

  const loadProductDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando detalhes do produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Produto não encontrado</p>
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
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">ID: {product.id}</p>
        </div>
        {product.active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircle className="h-4 w-4" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            <XCircle className="h-4 w-4" />
            Inativo
          </span>
        )}
      </div>

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preço
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data de Criação
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold" suppressHydrationWarning>{formatDate(product.created_at)}</div>
          </CardContent>
        </Card>

        {product.external_id && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ID Externo
              </CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold font-mono">{product.external_id}</div>
            </CardContent>
          </Card>
        )}
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Nome</h3>
            <p className="text-lg">{product.name}</p>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <p className="text-base">
                {product.active ? (
                  <span className="text-green-600 font-medium">Produto ativo e disponível para venda</span>
                ) : (
                  <span className="text-red-600 font-medium">Produto inativo</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Preço Unitário</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">ID da Organização</p>
            <p className="font-mono text-sm mt-1">{product.organization_id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
