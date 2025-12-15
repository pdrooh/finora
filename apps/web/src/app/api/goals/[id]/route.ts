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

    const { data: goal, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar meta' }, { status: 500 })
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .update({
        titulo,
        descricao: descricao || null,
        valor_objetivo: parseFloat(valor_objetivo),
        valor_atual: parseFloat(valor_atual || 0),
        prazo: prazo || null,
        status: status || 'ATIVA',
        aporte_mensal_sugerido: aporte_mensal_sugerido ? parseFloat(aporte_mensal_sugerido) : null,
        categoria: categoria || null,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return NextResponse.json({ error: 'Erro ao atualizar meta' }, { status: 500 })
    }

    return NextResponse.json(goal)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar meta' }, { status: 500 })
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
      .from('goals')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting goal:', error)
      return NextResponse.json({ error: 'Erro ao excluir meta' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao excluir meta' }, { status: 500 })
  }
}

