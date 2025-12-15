import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { pathname } = req.nextUrl

  // Get user only if needed (for protected routes or auth pages)
  const needsAuthCheck = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/onboarding') || 
    pathname === '/login' || 
    pathname === '/register'

  let user = null
  if (needsAuthCheck) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Only check onboarding for dashboard routes (not for every sub-route)
    // This reduces database queries significantly
    if (pathname === '/dashboard' && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      // If profile exists and onboarding is explicitly false or null, redirect to onboarding
      if (profile && (profile.onboarding_completed === false || profile.onboarding_completed === null)) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
    }
    
    // Redirect away from onboarding if already completed
    if (pathname.startsWith('/onboarding') && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed === true) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      // Otherwise, allow access to onboarding
      return response
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/login', '/register'],
}

