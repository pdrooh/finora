import { createSupabaseServerClient } from '@finora/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

async function getProfile(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

async function getCategories(userId: string) {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`is_default.eq.true,user_id.eq.${userId}`)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profile, categories] = await Promise.all([
    getProfile(user.id),
    getCategories(user.id),
  ])

  return <SettingsClient initialProfile={profile} initialCategories={categories} />
}

