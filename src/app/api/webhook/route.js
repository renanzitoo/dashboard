import { NextResponse } from 'next/server'

// Cache simples para notificar mudanças
const changes = new Map()

export async function POST(request) {
  try {
    const payload = await request.json()
    
    // Registra a mudança
    const table = payload.table
    const timestamp = Date.now()
    
    console.log('🔔 Webhook recebido:', {
      table,
      type: payload.type,
      timestamp
    })
    
    // Armazena a mudança
    changes.set(table, {
      timestamp,
      type: payload.type,
      data: payload.record
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook recebido'
    })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// GET para verificar se houve mudanças
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const since = parseInt(searchParams.get('since') || '0')
  
  if (!table) {
    return NextResponse.json({ hasChanges: false })
  }
  
  const change = changes.get(table)
  
  if (change && change.timestamp > since) {
    return NextResponse.json({
      hasChanges: true,
      timestamp: change.timestamp,
      type: change.type
    })
  }
  
  return NextResponse.json({ hasChanges: false })
}
