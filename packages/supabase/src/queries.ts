// Common query helpers
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type Client = SupabaseClient<Database>

export async function getMonthlySummary(client: Client, userId: string, monthKey: string) {
  return client
    .from('monthly_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle()
}

export async function getExpensesByCategory(client: Client, userId: string, monthKey: string) {
  return client
    .from('expenses_by_category_monthly')
    .select('*')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .order('total_value', { ascending: false })
}

export async function getUserProfile(client: Client, userId: string) {
  return client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function getUserSubscription(client: Client, userId: string) {
  return client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
}

