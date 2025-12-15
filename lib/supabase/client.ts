"use client"

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Client-side Supabase client (for use in components)
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      'Configuração do Supabase não encontrada. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
    console.error('Supabase configuration error:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    throw error
  }

  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw new Error('Erro ao inicializar conexão com o servidor. Tente recarregar a página.')
  }
}
