import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@finora/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json({ error: 'Erro ao buscar metas' }, { status: 500 })
    }

    return NextResponse.json(goals || [])
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao buscar metas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      titulo,
      descricao,
      valor_objetivo,
      valor_atual,
      prazo,
      status,
      aporte_mensal_sugerido,
      categoria,
    } = body

    if (!titulo || !valor_objetivo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: titulo, valor_objetivo' },
        { status: 400 }
      )
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        titulo,
        descricao: descricao || null,
        valor_objetivo: parseFloat(valor_objetivo),
        valor_atual: parseFloat(valor_atual || 0),
        prazo: prazo || null,
        status: status || 'ATIVA',
        aporte_mensal_sugerido: aporte_mensal_sugerido ? parseFloat(aporte_mensal_sugerido) : null,
        categoria: categoria || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      return NextResponse.json({ error: 'Erro ao criar meta' }, { status: 500 })
    }

    return NextResponse.json(goal, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao criar meta' }, { status: 500 })
  }
}

