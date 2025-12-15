'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingDown, Edit, Trash2, Search, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@finora/shared'
import { useToast } from '@/hooks/use-toast'
import { EmptyState } from '@/components/empty-state'
import type { Expense, Category } from '@finora/shared'

export function ExpensesClient({
  initialExpenses,
  categories,
}: {
  initialExpenses: any[]
  categories: Category[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = React.useState(initialExpenses)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterType, setFilterType] = React.useState<string>('all')

  const total = expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
  const totalFixa = expenses
    .filter((e) => e.tipo === 'FIXA')
    .reduce((sum, expense) => sum + Number(expense.valor), 0)
  const totalVariavel = expenses
    .filter((e) => e.tipo === 'VARIAVEL')
    .reduce((sum, expense) => sum + Number(expense.valor), 0)
  const totalParcelada = expenses
    .filter((e) => e.tipo === 'PARCELADA')
    .reduce((sum, expense) => sum + Number(expense.valor), 0)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || expense.tipo === filterType
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string, descricao: string) => {
    if (!confirm(`Tem certeza que deseja excluir a despesa "${descricao}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpenses(expenses.filter((e) => e.id !== id))
        toast({
          title: 'Despesa excluída',
          description: 'A despesa foi excluída com sucesso.',
        })
      } else {
        throw new Error('Erro ao excluir')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a despesa.',
        variant: 'destructive',
      })
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">Gerencie suas despesas</p>
        </div>
        <Button onClick={() => router.push('/dashboard/expenses/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} despesa{expenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalFixa)}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Variáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalVariavel)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Eventuais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceladas</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalParcelada)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Em parcelas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Despesas</CardTitle>
              <CardDescription>
                {filteredExpenses.length} de {expenses.length} despesa{expenses.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterType === 'FIXA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('FIXA')}
                >
                  Fixas
                </Button>
                <Button
                  variant={filterType === 'VARIAVEL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('VARIAVEL')}
                >
                  Variáveis
                </Button>
                <Button
                  variant={filterType === 'PARCELADA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('PARCELADA')}
                >
                  Parceladas
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title={
                expenses.length === 0
                  ? 'Nenhuma despesa cadastrada'
                  : 'Nenhuma despesa encontrada'
              }
              description={
                expenses.length === 0
                  ? 'Comece registrando suas despesas para ter controle total das suas finanças.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'
              }
              action={
                expenses.length === 0
                  ? {
                      label: 'Cadastrar Primeira Despesa',
                      onClick: () => router.push('/dashboard/expenses/new'),
                    }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(expense.category_id)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          expense.tipo === 'FIXA'
                            ? 'default'
                            : expense.tipo === 'VARIAVEL'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {expense.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(Number(expense.valor))}
                    </TableCell>
                    <TableCell>{formatDate(expense.data)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/expenses/${expense.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id, expense.descricao)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

