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

    const { data: incomes, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Error fetching incomes:', error)
      return NextResponse.json({ error: 'Erro ao buscar receitas' }, { status: 500 })
    }

    return NextResponse.json(incomes || [])
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao buscar receitas' }, { status: 500 })
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
    const { tipo, valor, descricao, recorrencia, data_inicio, data_fim, ativo, category_id } = body

    if (!tipo || !valor || !descricao || !data_inicio) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, valor, descricao, data_inicio' },
        { status: 400 }
      )
    }

    const { data: income, error } = await supabase
      .from('incomes')
      .insert({
        user_id: user.id,
        tipo,
        valor: parseFloat(valor),
        descricao,
        recorrencia: recorrencia || null,
        data_inicio,
        data_fim: data_fim || null,
        ativo: ativo !== undefined ? ativo : true,
        category_id: category_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating income:', error)
      return NextResponse.json({ error: 'Erro ao criar receita' }, { status: 500 })
    }

    return NextResponse.json(income, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao criar receita' }, { status: 500 })
  }
}

