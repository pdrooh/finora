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

    const { data: debts, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Error fetching debts:', error)
      return NextResponse.json({ error: 'Erro ao buscar dívidas' }, { status: 500 })
    }

    return NextResponse.json(debts || [])
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dívidas' }, { status: 500 })
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
      nome,
      tipo,
      valor_total,
      valor_restante,
      taxa_juros,
      tipo_juros,
      parcela_mensal,
      total_parcelas,
      data_inicio,
      data_vencimento,
      status,
      observacoes,
    } = body

    if (!nome || !tipo || !valor_total || !parcela_mensal || !total_parcelas || !data_inicio) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: nome, tipo, valor_total, parcela_mensal, total_parcelas, data_inicio',
        },
        { status: 400 }
      )
    }

    const { data: debt, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        nome,
        tipo,
        valor_total: parseFloat(valor_total),
        valor_restante: parseFloat(valor_restante || valor_total),
        taxa_juros: parseFloat(taxa_juros || 0),
        tipo_juros: tipo_juros || null,
        parcela_mensal: parseFloat(parcela_mensal),
        total_parcelas: parseInt(total_parcelas),
        parcela_atual: 1,
        data_inicio,
        data_vencimento: data_vencimento || null,
        status: status || 'ATIVA',
        observacoes: observacoes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating debt:', error)
      return NextResponse.json({ error: 'Erro ao criar dívida' }, { status: 500 })
    }

    return NextResponse.json(debt, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao criar dívida' }, { status: 500 })
  }
}

