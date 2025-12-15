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

    const { data: debt, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !debt) {
      return NextResponse.json({ error: 'Dívida não encontrada' }, { status: 404 })
    }

    return NextResponse.json(debt)
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar dívida' }, { status: 500 })
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
      nome,
      tipo,
      valor_total,
      valor_restante,
      taxa_juros,
      tipo_juros,
      parcela_mensal,
      total_parcelas,
      parcela_atual,
      data_inicio,
      data_vencimento,
      status,
      observacoes,
    } = body

    // Verify ownership
    const { data: existing } = await supabase
      .from('debts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Dívida não encontrada' }, { status: 404 })
    }

    const { data: debt, error } = await supabase
      .from('debts')
      .update({
        nome,
        tipo,
        valor_total: parseFloat(valor_total),
        valor_restante: parseFloat(valor_restante),
        taxa_juros: parseFloat(taxa_juros || 0),
        tipo_juros: tipo_juros || null,
        parcela_mensal: parseFloat(parcela_mensal),
        total_parcelas: parseInt(total_parcelas),
        parcela_atual: parseInt(parcela_atual || 1),
        data_inicio,
        data_vencimento: data_vencimento || null,
        status: status || 'ATIVA',
        observacoes: observacoes || null,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating debt:', error)
      return NextResponse.json({ error: 'Erro ao atualizar dívida' }, { status: 500 })
    }

    return NextResponse.json(debt)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar dívida' }, { status: 500 })
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
      .from('debts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Dívida não encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting debt:', error)
      return NextResponse.json({ error: 'Erro ao excluir dívida' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao excluir dívida' }, { status: 500 })
  }
}

