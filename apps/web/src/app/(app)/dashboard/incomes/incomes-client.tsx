'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, Edit, Trash2, Search } from 'lucide-react'
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
import type { Income } from '@finora/shared'

export function IncomesClient({ 
  initialIncomes, 
  profile 
}: { 
  initialIncomes: Income[]
  profile?: { salario_fixo?: number | null; frequencia_recebimento?: string | null } | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [incomes, setIncomes] = React.useState(initialIncomes)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterType, setFilterType] = React.useState<string>('all')

  // Verificar se salário fixo já está nas receitas
  const hasSalarioInIncomes = profile?.salario_fixo && 
    Number(profile.salario_fixo) > 0 &&
    incomes.some(
      (i) => i.tipo === 'FIXO' && Number(i.valor) === Number(profile.salario_fixo)
    )

  // Criar lista de receitas incluindo salário fixo se não estiver presente
  const allIncomes = React.useMemo(() => {
    const incomesList = [...incomes]
    
    // Adicionar salário fixo se não estiver nas receitas
    if (profile?.salario_fixo && Number(profile.salario_fixo) > 0 && !hasSalarioInIncomes) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      incomesList.unshift({
        id: 'salario-fixo-profile',
        user_id: '',
        tipo: 'FIXO',
        valor: Number(profile.salario_fixo),
        descricao: 'Salário Fixo',
        recorrencia: profile.frequencia_recebimento || 'MENSAL',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: null,
        ativo: true,
        category_id: null,
        month_key: currentMonth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Income)
    }
    
    return incomesList
  }, [incomes, profile, hasSalarioInIncomes])

  const total = allIncomes.reduce((sum, income) => sum + Number(income.valor), 0)
  const totalFixo = allIncomes
    .filter((i) => i.tipo === 'FIXO' && i.ativo)
    .reduce((sum, income) => sum + Number(income.valor), 0)
  const totalExtra = allIncomes
    .filter((i) => i.tipo === 'EXTRA')
    .reduce((sum, income) => sum + Number(income.valor), 0)

  const filteredIncomes = allIncomes.filter((income) => {
    const matchesSearch = income.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || income.tipo === filterType
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string, descricao: string) => {
    if (!confirm(`Tem certeza que deseja excluir a receita "${descricao}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIncomes(incomes.filter((i) => i.id !== id))
        toast({
          title: 'Receita excluída',
          description: 'A receita foi excluída com sucesso.',
        })
      } else {
        throw new Error('Erro ao excluir')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a receita.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">Gerencie suas receitas</p>
        </div>
        <Button onClick={() => router.push('/dashboard/incomes/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {allIncomes.length} receita{allIncomes.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalFixo)}</div>
            <p className="text-xs text-muted-foreground mt-1">Mensais recorrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalExtra)}</div>
            <p className="text-xs text-muted-foreground mt-1">Eventuais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Receitas</CardTitle>
              <CardDescription>
                {filteredIncomes.length} de {incomes.length} receita{incomes.length !== 1 ? 's' : ''}
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
                  variant={filterType === 'FIXO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('FIXO')}
                >
                  Fixas
                </Button>
                <Button
                  variant={filterType === 'EXTRA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('EXTRA')}
                >
                  Extras
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncomes.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={
                incomes.length === 0
                  ? 'Nenhuma receita cadastrada'
                  : 'Nenhuma receita encontrada'
              }
              description={
                incomes.length === 0
                  ? 'Comece adicionando sua primeira receita para começar a controlar suas finanças.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'
              }
              action={
                incomes.length === 0
                  ? {
                      label: 'Cadastrar Primeira Receita',
                      onClick: () => router.push('/dashboard/incomes/new'),
                    }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((income) => {
                  const isSalarioFixo = income.id === 'salario-fixo-profile'
                  return (
                    <TableRow 
                      key={income.id}
                      className={isSalarioFixo ? 'bg-green-50 dark:bg-green-950/20' : ''}
                    >
                      <TableCell className="font-medium">{income.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={income.tipo === 'FIXO' ? 'default' : 'secondary'}>
                          {income.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(Number(income.valor))}
                      </TableCell>
                      <TableCell>{formatDate(income.data_inicio)}</TableCell>
                      <TableCell>
                        {income.ativo ? (
                          <Badge variant="outline" className="text-green-600">
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            Inativa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                      {isSalarioFixo ? (
                        <span className="text-xs text-muted-foreground">Do perfil</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/incomes/${income.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(income.id, income.descricao)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

