// Hook para escutar mudanças via Supabase Realtime (WebSocket)
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeSubscription({ table, onUpdate, event = '*' }) {
  const supabaseRef = useRef(null)
  
  useEffect(() => {
    // Reutiliza a mesma instância do client
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    
    const supabase = supabaseRef.current
    
    // Subscreve aos eventos da tabela via WebSocket
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
          console.log(`[Realtime] ${table}:`, payload.eventType, payload)
          onUpdate(payload)
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${table} status:`, status)
      })

    // Cleanup: remove a subscrição quando o componente desmontar
    return () => {
      console.log(`[Realtime] Unsubscribing from ${table}`)
      supabase.removeChannel(channel)
    }
  }, [table, event]) // Removido onUpdate das dependências
}
