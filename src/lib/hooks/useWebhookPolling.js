
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeSubscription({ table, onUpdate, event = '*' }) {
  const supabaseRef = useRef(null)
  
  useEffect(() => {

    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`${table}-changes-${Date.now()}`) // ID único para evitar conflitos
      .on(
        'postgres_changes',
        {
          event, // '*' para todos eventos, ou 'INSERT', 'UPDATE', 'DELETE'
          schema: 'public',
          table: table
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIPTION_ERROR') {
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event]) // Removido onUpdate das dependências
}

export function useWebhookPolling({ tables = [], onUpdate, interval = 2000 }) {
  const lastCheckRef = useRef({})
  
  useEffect(() => {

    tables.forEach(table => {
      if (!lastCheckRef.current[table]) {
        lastCheckRef.current[table] = Date.now()
      }
    })
    
    const checkWebhooks = async () => {
      try {
        let hasChanges = false
        
        for (const table of tables) {
          const response = await fetch(`/api/webhook?table=${table}&since=${lastCheckRef.current[table]}`)
          const data = await response.json()
          
          if (data.hasChanges) {
            lastCheckRef.current[table] = data.timestamp
            hasChanges = true
          }
        }
        
        if (hasChanges && onUpdate) {
          onUpdate()
        }
      } catch (error) {
      }
    }

    checkWebhooks()

    const intervalId = setInterval(checkWebhooks, interval)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [tables, onUpdate, interval])
}
