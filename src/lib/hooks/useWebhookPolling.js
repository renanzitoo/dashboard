// Hook para escutar mudanças via Supabase Realtime (WebSocket)
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeSubscription({ table, onUpdate, event = '*' }) {
  useEffect(() => {
    const supabase = createClient()
    
    // Subscreve aos eventos da tabela via WebSocket
    const channel = supabase
      .channel(`${table}-changes`)
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
      .subscribe()

    // Cleanup: remove a subscrição quando o componente desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, onUpdate, event])
}
