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

    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*, categories(*)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !expense) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar despesa' }, { status: 500 })
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
    const { category_id, tipo, valor, descricao, data, recorrencia, is_recurring } = body

    // Verify ownership
    const { data: existing } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        category_id,
        tipo,
        valor: parseFloat(valor),
        descricao,
        data,
        recorrencia: recorrencia || null,
        is_recurring: is_recurring || false,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating expense:', error)
      return NextResponse.json({ error: 'Erro ao atualizar despesa' }, { status: 500 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar despesa' }, { status: 500 })
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
      .from('expenses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting expense:', error)
      return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 })
  }
}

