'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Edit, Trash2, Search, CheckCircle2 } from 'lucide-react'
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
import { formatCurrency, formatDate, calculateGoalProgress, type Goal } from '@finora/shared'
import { useToast } from '@/hooks/use-toast'

export function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [goals, setGoals] = React.useState(initialGoals)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')

  const totalGoals = goals.length
  const activeGoals = goals.filter((g) => g.status === 'ATIVA').length
  const completedGoals = goals.filter((g) => g.status === 'CONCLUIDA').length
  const totalValue = goals
    .filter((g) => g.status === 'ATIVA')
    .reduce((sum, goal) => sum + Number(goal.valor_objetivo), 0)
  const currentValue = goals
    .filter((g) => g.status === 'ATIVA')
    .reduce((sum, goal) => sum + Number(goal.valor_atual), 0)

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || goal.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir a meta "${titulo}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoals(goals.filter((g) => g.id !== id))
        toast({
          title: 'Meta excluída',
          description: 'A meta foi excluída com sucesso.',
        })
      } else {
        throw new Error('Erro ao excluir')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a meta.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return <Badge variant="default">Ativa</Badge>
      case 'CONCLUIDA':
        return <Badge variant="default" className="bg-green-600">Concluída</Badge>
      case 'CANCELADA':
        return <Badge variant="outline">Cancelada</Badge>
      case 'PAUSADA':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pausada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">Gerencie suas metas financeiras</p>
        </div>
        <Button onClick={() => router.push('/dashboard/goals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeGoals} ativa{activeGoals !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Objetivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(currentValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((currentValue / totalValue) * 100 || 0).toFixed(1)}% do objetivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Metas</CardTitle>
              <CardDescription>
                {filteredGoals.length} de {goals.length} meta{goals.length !== 1 ? 's' : ''}
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
                  variant={filterStatus === 'CONCLUIDA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('CONCLUIDA')}
                >
                  Concluídas
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGoals.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {goals.length === 0
                  ? 'Nenhuma meta cadastrada ainda'
                  : 'Nenhuma meta encontrada com os filtros aplicados'}
              </p>
              {goals.length === 0 && (
                <Button onClick={() => router.push('/dashboard/goals/new')}>
                  Cadastrar Primeira Meta
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Valor Objetivo</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGoals.map((goal) => {
                  const progress = calculateGoalProgress(goal)
                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.titulo}</TableCell>
                      <TableCell>{formatCurrency(Number(goal.valor_objetivo))}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(Number(goal.valor_atual))}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progress.progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {progress.progressPercent.toFixed(1)}% • Falta{' '}
                            {formatCurrency(progress.remaining)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {goal.prazo ? formatDate(goal.prazo) : 'Sem prazo'}
                      </TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/goals/${goal.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(goal.id, goal.titulo)}
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

