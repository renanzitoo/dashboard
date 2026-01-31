'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WebhookTestPage() {
  const [logs, setLogs] = useState([])
  const [testing, setTesting] = useState(false)

  const testWebhook = async () => {
    setTesting(true)
    try {
      // Teste POST
      const postResponse = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'customers',
          type: 'INSERT',
          record: { id: 'test-123', name: 'Teste Manual' }
        })
      })
      const postData = await postResponse.json()
      
      addLog('✅ POST enviado com sucesso: ' + JSON.stringify(postData))
      
      // Aguardar 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Teste GET
      const getResponse = await fetch('/api/webhook?table=customers&since=0')
      const getData = await getResponse.json()
      
      addLog('📊 GET resultado: ' + JSON.stringify(getData))
      
    } catch (error) {
      addLog('❌ Erro: ' + error.message)
    }
    setTesting(false)
  }

  const checkChanges = async () => {
    try {
      const tables = ['customers', 'appointments', 'conversations', 'messages']
      
      for (const table of tables) {
        const response = await fetch(`/api/webhook?table=${table}&since=0`)
        const data = await response.json()
        
        if (data.hasChanges) {
          addLog(`🔔 ${table}: Mudança detectada!`)
        } else {
          addLog(`⚪ ${table}: Sem mudanças`)
        }
      }
    } catch (error) {
      addLog('❌ Erro ao verificar: ' + error.message)
    }
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50))
  }

  useEffect(() => {
    addLog('🚀 Página de teste iniciada')
    
    // Verificar mudanças a cada 3 segundos
    const interval = setInterval(() => {
      addLog('🔍 Verificando mudanças...')
      checkChanges()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen p-8 flex flex-col">
      <div className="max-w-4xl mx-auto space-y-6 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste de Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testWebhook}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? 'Testando...' : '🔵 Testar Webhook Manual'}
              </button>
              
              <button
                onClick={checkChanges}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🔍 Verificar Mudanças
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                🗑️ Limpar Logs
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>• Este teste envia um webhook falso e verifica se foi recebido</p>
              <p>• Também verifica automaticamente mudanças a cada 3 segundos</p>
              <p>• Insira dados no Supabase e veja se aparece aqui!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Logs ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500">Aguardando logs...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>URL do Webhook:</strong>
              <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                https://dashboard-fhpp.vercel.app/api/webhook
              </code>
            </div>
            <div>
              <strong>Método:</strong> POST
            </div>
            <div>
              <strong>Tabelas monitoradas:</strong> customers, appointments, conversations, messages
            </div>
          </CardContent>
        </Card>
        
        {/* Footer - Copyright Section */}
        <footer className="mt-auto pt-8 pb-4">
          <p className="text-center text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Oxyon AI. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}
