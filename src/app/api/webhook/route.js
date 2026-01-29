import { NextResponse } from 'next/server'

// Cache simples para notificar mudanças
const changes = new Map()

export async function POST(request) {
  try {
    const payload = await request.json()
    
    console.log('🔔 Webhook recebido - Payload completo:', payload)
    
    // Tentar extrair o nome da tabela de diferentes campos possíveis
    const table = payload.table || 
                  payload.table_name || 
                  payload.schema?.table || 
                  payload.record?.table ||
                  'unknown'
    
    const type = payload.type || payload.operation || payload.event || 'unknown'
    const timestamp = Date.now()
    
    console.log('🔔 Webhook processado:', {
      table,
      type,
      timestamp,
      payloadKeys: Object.keys(payload)
    })
    
    // Armazena a mudança
    changes.set(table, {
      timestamp,
      type,
      data: payload.record || payload.new || payload
    })
    
    // Também armazena um "all" para forçar atualização geral
    changes.set('_all', { timestamp, type, table })
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook recebido',
      table,
      type
    })
  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook', details: error.message },
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
