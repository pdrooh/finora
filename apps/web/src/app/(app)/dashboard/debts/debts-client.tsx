'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CreditCard, Edit, Trash2, Search, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, calculateDebtProgress, type Debt } from '@finora/shared'
import { useToast } from '@/hooks/use-toast'

export function DebtsClient({ initialDebts }: { initialDebts: Debt[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [debts, setDebts] = React.useState(initialDebts)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')

  const totalDebts = debts.reduce((sum, debt) => sum + Number(debt.valor_restante), 0)
  const totalMonthly = debts
    .filter((d) => d.status === 'ATIVA')
    .reduce((sum, debt) => sum + Number(debt.parcela_mensal), 0)
  const activeDebts = debts.filter((d) => d.status === 'ATIVA').length
  const paidDebts = debts.filter((d) => d.status === 'QUITADA').length

  const filteredDebts = debts.filter((debt) => {
    const matchesSearch = debt.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || debt.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a dívida "${nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDebts(debts.filter((d) => d.id !== id))
        toast({
          title: 'Dívida excluída',
          description: 'A dívida foi excluída com sucesso.',
        })
      } else {
        throw new Error('Erro ao excluir')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a dívida.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return <Badge variant="destructive">Ativa</Badge>
      case 'QUITADA':
        return <Badge variant="default" className="bg-green-600">Quitada</Badge>
      case 'VENCIDA':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Vencida</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dívidas</h1>
          <p className="text-muted-foreground">Gerencie suas dívidas e empréstimos</p>
        </div>
        <Button onClick={() => router.push('/dashboard/debts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Dívida
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Dívidas</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebts)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {debts.length} dívida{debts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas Mensais</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalMonthly)}</div>
            <p className="text-xs text-muted-foreground mt-1">Por mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDebts}</div>
            <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidDebts}</div>
            <p className="text-xs text-muted-foreground mt-1">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Dívidas</CardTitle>
              <CardDescription>
                {filteredDebts.length} de {debts.length} dívida{debts.length !== 1 ? 's' : ''}
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
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'ATIVA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('ATIVA')}
                >
                  Ativas
                </Button>
                <Button
                  variant={filterStatus === 'QUITADA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('QUITADA')}
                >
                  Quitadas
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDebts.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {debts.length === 0
                  ? 'Nenhuma dívida cadastrada ainda'
                  : 'Nenhuma dívida encontrada com os filtros aplicados'}
              </p>
              {debts.length === 0 && (
                <Button onClick={() => router.push('/dashboard/debts/new')}>
                  Cadastrar Primeira Dívida
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Parcela Mensal</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.map((debt) => {
                  const progress = calculateDebtProgress(debt)
                  return (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{debt.tipo}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(debt.valor_total))}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(Number(debt.valor_restante))}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(debt.parcela_mensal))}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progress.progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {progress.progressPercent.toFixed(1)}% • {debt.parcela_atual}/
                            {debt.total_parcelas} parcelas
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(debt.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/debts/${debt.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(debt.id, debt.nome)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

