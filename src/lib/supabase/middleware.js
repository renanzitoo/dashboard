import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/webhook') &&
    !request.nextUrl.pathname.startsWith('/sobre')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/') {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('bot_type')
        .eq('id', user.id)
        .single()

      const url = request.nextUrl.clone()
      if (userData?.bot_type === 'shop') {
        url.pathname = '/dashboard-shop'
        return NextResponse.redirect(url)
      } else {
        url.pathname = '/dashboard-service'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard-service'
      return NextResponse.redirect(url)
    }
  }

  if (user && request.nextUrl.pathname.startsWith('/dashboard-service')) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('bot_type')
        .eq('id', user.id)
        .single()

      if (userData?.bot_type === 'shop') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard-shop'
        return NextResponse.redirect(url)
      }
    } catch (error) {
    }
  }

  if (user && request.nextUrl.pathname.startsWith('/dashboard-shop')) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('bot_type')
        .eq('id', user.id)
        .single()

      if (userData?.bot_type === 'atendant' || !userData?.bot_type) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard-service'
        return NextResponse.redirect(url)
      }
    } catch (error) {
    }
  }

  return supabaseResponse
}
