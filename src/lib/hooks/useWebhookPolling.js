// Hook para escutar mudanças via webhooks
import { useEffect, useCallback, useRef } from 'react'

export function useWebhookPolling({ table, onUpdate, interval = 2000 }) {
  const lastCheckRef = useRef(Date.now())
  const pollingRef = useRef(null)

  const checkForChanges = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/webhook?table=${table}&since=${lastCheckRef.current}`
      )
      const data = await response.json()
      
      if (data.hasChanges) {
        lastCheckRef.current = data.timestamp
        onUpdate()
      }
    } catch (error) {
    }
  }, [table, onUpdate])

  useEffect(() => {
    // Primeira verificação
    checkForChanges()
    
    // Polling leve para verificar mudanças
    pollingRef.current = setInterval(checkForChanges, interval)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [checkForChanges, interval])
}
