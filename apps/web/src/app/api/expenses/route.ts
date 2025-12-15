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

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .order('data', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 })
    }

    return NextResponse.json(expenses || [])
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 })
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
      category_id,
      tipo,
      valor,
      descricao,
      data,
      recorrencia,
      is_recurring,
      total_installments,
      data_inicio,
    } = body

    if (!category_id || !tipo || !valor || !descricao || !data) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: category_id, tipo, valor, descricao, data' },
        { status: 400 }
      )
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category_id,
        tipo,
        valor: parseFloat(valor),
        descricao,
        data,
        recorrencia: recorrencia || null,
        is_recurring: is_recurring || false,
      })
      .select()
      .single()

    if (expenseError) {
      console.error('Error creating expense:', expenseError)
      return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 })
    }

    // If parceled, create installments
    if (tipo === 'PARCELADA' && total_installments && data_inicio) {
      const installmentValue = parseFloat(valor) / parseInt(total_installments)
      const installments = []

      for (let i = 1; i <= parseInt(total_installments); i++) {
        const dueDate = new Date(data_inicio)
        dueDate.setMonth(dueDate.getMonth() + i - 1)

        installments.push({
          expense_id: expense.id,
          user_id: user.id,
          installment_number: i,
          total_installments: parseInt(total_installments),
          valor: installmentValue,
          data_vencimento: dueDate.toISOString().split('T')[0],
          pago: false,
        })
      }

      const { error: installmentsError } = await supabase
        .from('expense_installments')
        .insert(installments)

      if (installmentsError) {
        console.error('Error creating installments:', installmentsError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 })
  }
}

