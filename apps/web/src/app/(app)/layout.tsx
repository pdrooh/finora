import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createSupabaseServerClient } from '@finora/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

// Cache the user check to avoid duplicate queries
const getCachedUser = cache(async () => {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cache the profile check
const getCachedProfile = cache(async (userId: string) => {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single()
  return profile
})

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Use cached functions to avoid duplicate queries
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  // Check onboarding (cached)
  const profile = await getCachedProfile(user.id)

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}

