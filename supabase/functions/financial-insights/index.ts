// Supabase Edge Function for Financial Intelligence
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // Get current month expenses
    const { data: currentExpenses, error: expensesError } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('data', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .lt('data', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)

    if (expensesError) throw expensesError

    // Get last month expenses
    const { data: lastExpenses, error: lastExpensesError } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('data', `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-01`)
      .lt('data', `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`)

    if (lastExpensesError) throw lastExpensesError

    // Calculate insights
    const insights = []

    // Group by category
    const currentByCategory: Record<string, number> = {}
    const lastByCategory: Record<string, number> = {}

    currentExpenses?.forEach(exp => {
      currentByCategory[exp.categoria] = (currentByCategory[exp.categoria] || 0) + Number(exp.valor)
    })

    lastExpenses?.forEach(exp => {
      lastByCategory[exp.categoria] = (lastByCategory[exp.categoria] || 0) + Number(exp.valor)
    })

    // Generate insights
    Object.keys(currentByCategory).forEach(categoria => {
      const current = currentByCategory[categoria]
      const last = lastByCategory[categoria] || 0
      
      if (last > 0) {
        const change = ((current - last) / last) * 100
        
        if (Math.abs(change) > 15) {
          insights.push({
            type: change > 0 ? 'warning' : 'info',
            category: categoria,
            message: `Você gastou ${Math.abs(change).toFixed(0)}% ${change > 0 ? 'a mais' : 'a menos'} com ${categoria} este mês.`,
            change: change.toFixed(1),
            current: current,
            last: last
          })
        }
      }
    })

    // Total spending comparison
    const currentTotal = currentExpenses?.reduce((sum, exp) => sum + Number(exp.valor), 0) || 0
    const lastTotal = lastExpenses?.reduce((sum, exp) => sum + Number(exp.valor), 0) || 0
    
    if (lastTotal > 0) {
      const totalChange = ((currentTotal - lastTotal) / lastTotal) * 100
      insights.push({
        type: totalChange > 20 ? 'alert' : 'info',
        category: 'GERAL',
        message: `Gastos totais ${totalChange > 0 ? 'aumentaram' : 'diminuíram'} ${Math.abs(totalChange).toFixed(0)}% em relação ao mês anterior.`,
        change: totalChange.toFixed(1),
        current: currentTotal,
        last: lastTotal
      })
    }

    return new Response(
      JSON.stringify({ insights, summary: { currentTotal, lastTotal } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

