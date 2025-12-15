'use client'

import * as React from 'react'
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate, getMonthKey } from '@finora/shared'
import { useToast } from '@/hooks/use-toast'

export function ReportsClient({ initialData }: { initialData: any }) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState(
    new Date().toISOString().slice(0, 7)
  )
  const [data, setData] = React.useState(initialData)

  const handleExportCSV = () => {
    setLoading(true)
    try {
      const csvRows = []

      // Header
      csvRows.push('Tipo,Descrição,Valor,Data,Categoria')

      // Incomes
      data.incomes.forEach((income: any) => {
        csvRows.push(
          `Receita,"${income.descricao}",${income.valor},${income.data_inicio},${income.tipo}`
        )
      })

      // Expenses
      data.expenses.forEach((expense: any) => {
        const categoryName = expense.categories?.name || 'Sem categoria'
        csvRows.push(
          `Despesa,"${expense.descricao}",${expense.valor},${expense.data},${categoryName}`
        )
      })

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio-financeiro-${selectedMonth}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'CSV exportado!',
        description: 'O arquivo foi baixado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar CSV',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Exportação PDF será implementada em breve.',
    })
  }

  // Calcular total de receitas incluindo salário fixo do perfil
  let totalIncome = data.incomes.reduce((sum: number, i: any) => sum + Number(i.valor), 0)
  
  // Verificar se salário fixo está nas receitas
  const hasSalarioInIncomes = data.profile?.salario_fixo && 
    Number(data.profile.salario_fixo) > 0 &&
    data.incomes.some(
      (i: any) => i.tipo === 'FIXO' && Number(i.valor) === Number(data.profile.salario_fixo)
    )
  
  // Se há salário fixo no perfil e não está nas receitas, adicionar ao total
  if (data.profile?.salario_fixo && Number(data.profile.salario_fixo) > 0 && !hasSalarioInIncomes) {
    totalIncome += Number(data.profile.salario_fixo)
  }
  
  // Calcular número total de lançamentos (receitas + despesas)
  const totalIncomesCount = data.incomes.length + (hasSalarioInIncomes ? 0 : (data.profile?.salario_fixo && Number(data.profile.salario_fixo) > 0 ? 1 : 0))
  const totalExpensesCount = data.expenses.length
  const totalLancamentos = totalIncomesCount + totalExpensesCount
  
  const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + Number(e.valor), 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Exporte seus dados financeiros</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} disabled={loading} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleExportPDF} disabled={loading} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Selecione o período para o relatório</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="month">Mês/Ano</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-muted-foreground">
                {data.incomes.length + (data.profile?.salario_fixo && Number(data.profile.salario_fixo) > 0 && !data.incomes.some((i: any) => i.tipo === 'FIXO' && Number(i.valor) === Number(data.profile.salario_fixo)) ? 1 : 0)} lançamentos
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-muted-foreground">{data.expenses.length} lançamentos</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Saldo</p>
              <p
                className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalLancamentos} lançamentos totais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
            <CardDescription>Lista de receitas do período</CardDescription>
          </CardHeader>
          <CardContent>
            {data.incomes.length === 0 && !(data.profile?.salario_fixo && Number(data.profile.salario_fixo) > 0) ? (
              <p className="text-sm text-muted-foreground">Nenhuma receita neste período</p>
            ) : (
              <div className="space-y-2">
                {/* Mostrar salário fixo se não estiver nas receitas */}
                {data.profile?.salario_fixo && 
                 Number(data.profile.salario_fixo) > 0 && 
                 !data.incomes.some((i: any) => i.tipo === 'FIXO' && Number(i.valor) === Number(data.profile.salario_fixo)) && (
                  <div className="flex items-center justify-between p-2 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <p className="font-medium">Salário Fixo</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMonth} • FIXO
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(Number(data.profile.salario_fixo))}
                    </p>
                  </div>
                )}
                {/* Mostrar receitas da tabela */}
                {data.incomes.map((income: any) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{income.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(income.data_inicio)} • {income.tipo}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(Number(income.valor))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <CardDescription>Lista de despesas do período</CardDescription>
          </CardHeader>
          <CardContent>
            {data.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma despesa neste período</p>
            ) : (
              <div className="space-y-2">
                {data.expenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{expense.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.data)} • {expense.categories?.name || 'Sem categoria'}
                      </p>
                    </div>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(Number(expense.valor))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

