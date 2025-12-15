import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@finora/supabase/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { data: income, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !income) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar receita' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('incomes')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 })
    }

    const { data: income, error } = await supabase
      .from('incomes')
      .update({
        tipo,
        valor: parseFloat(valor),
        descricao,
        recorrencia: recorrencia || null,
        data_inicio,
        data_fim: data_fim || null,
        ativo: ativo !== undefined ? ativo : true,
        category_id: category_id || null,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating income:', error)
      return NextResponse.json({ error: 'Erro ao atualizar receita' }, { status: 500 })
    }

    return NextResponse.json(income)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar receita' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('incomes')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting income:', error)
      return NextResponse.json({ error: 'Erro ao excluir receita' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao excluir receita' }, { status: 500 })
  }
}

