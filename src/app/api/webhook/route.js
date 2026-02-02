import { NextResponse } from 'next/server'

const changes = new Map()

export async function POST(request) {
  try {
    const payload = await request.json()

    const table = payload.table || 
                  payload.table_name || 
                  payload.schema?.table || 
                  payload.record?.table ||
                  'unknown'
    
    const type = payload.type || payload.operation || payload.event || 'unknown'
    const timestamp = Date.now()

    changes.set(table, {
      timestamp,
      type,
      data: payload.record || payload.new || payload
    })

    changes.set('_all', { timestamp, type, table })
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook recebido',
      table,
      type
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar webhook', details: error.message },
      { status: 500 }
    )
  }
}

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
