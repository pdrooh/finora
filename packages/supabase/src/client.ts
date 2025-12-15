import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createSupabaseClient(url: string, anonKey: string) {
  return createBrowserClient<Database>(url, anonKey)
}

