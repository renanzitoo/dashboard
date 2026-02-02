import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'


export function useBotType() {
  const [botType, setBotType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBotType() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setBotType(null)
          setLoading(false)
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('bot_type')
          .eq('id', user.id)
          .single()

        if (userError) {
          setError(userError)
          setBotType(null)
        } else {
          setBotType(userData?.bot_type || 'atendant') // default para atendant se não tiver bot_type
        }
      } catch (err) {
        setError(err)
        setBotType(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBotType()
  }, [])

  return { botType, loading, error }
}


export function useCheckAccess(requiredType) {
  const { botType, loading } = useBotType()
  
  const hasAccess = loading ? null : botType === requiredType

  return { hasAccess, loading }
}
