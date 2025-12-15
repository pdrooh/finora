'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, getCurrentMonthKey } from '@finora/shared'
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react'

interface DashboardData {
  summary: any
  expenses: any[]
  totalIncome: number
  totalExpenses: number
  totalDebts: number
  monthlyDebtPayments: number
  balance: number
  monthlyData: any[]
  categoryExpenses: any[]
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E', '#6C5CE7', '#A29BFE']

export function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonthKey())

  // Prepare data for charts
  const lineChartData = React.useMemo(() => {
    if (!data.monthlyData || data.monthlyData.length === 0) {
      return []
    }
    return data.monthlyData.map((item) => ({
      month: item.month_key,
      receitas: Number(item.receitas_total || 0),
      despesas: Number(item.despesas_total || 0),
      saldo: Number(item.saldo || 0),
    }))
  }, [data.monthlyData])

  const pieChartData = React.useMemo(() => {
    if (!data.categoryExpenses || data.categoryExpenses.length === 0) {
      return []
    }
    return data.categoryExpenses.slice(0, 8).map((item) => ({
      name: item.category_name,
      value: Number(item.total_value || 0),
    }))
  }, [data.categoryExpenses])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua situação financeira</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(data.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas - Dívidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.totalDebts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.monthlyDebtPayments)}/mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
                <CardDescription>Receitas vs Despesas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return `${month}/${year.slice(2)}`
                        }}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => {
                          const [year, month] = label.split('-')
                          const monthNames = [
                            'Jan',
                            'Fev',
                            'Mar',
                            'Abr',
                            'Mai',
                            'Jun',
                            'Jul',
                            'Ago',
                            'Set',
                            'Out',
                            'Nov',
                            'Dez',
                          ]
                          return `${monthNames[parseInt(month) - 1]}/${year}`
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="receitas"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Receitas"
                      />
                      <Line
                        type="monotone"
                        dataKey="despesas"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Despesas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição das despesas este mês</CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Saldo</CardTitle>
              <CardDescription>Saldo mensal ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-')
                        return `${month}/${year.slice(2)}`
                      }}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => {
                        const [year, month] = label.split('-')
                        const monthNames = [
                          'Jan',
                          'Fev',
                          'Mar',
                          'Abr',
                          'Mai',
                          'Jun',
                          'Jul',
                          'Ago',
                          'Set',
                          'Out',
                          'Nov',
                          'Dez',
                        ]
                        return `${monthNames[parseInt(month) - 1]}/${year}`
                      }}
                    />
                    <Legend />
                    <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Categorias</CardTitle>
              <CardDescription>Despesas por categoria este mês</CardDescription>
            </CardHeader>
            <CardContent>
              {data.categoryExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={data.categoryExpenses.slice(0, 10)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                    <YAxis
                      dataKey="category_name"
                      type="category"
                      width={120}
                    />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="total_value" fill="#ef4444" name="Valor" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Top categorias deste mês</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categoryExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma despesa este mês</p>
            ) : (
              <div className="space-y-2">
                {data.categoryExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.category_id} className="flex items-center justify-between">
                    <span className="text-sm">{expense.category_name}</span>
                    <span className="font-medium">{formatCurrency(expense.total_value)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Análise do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receitas</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(data.totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Despesas</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Parcelas de Dívidas</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(data.monthlyDebtPayments)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-2">
                <span className="font-medium">Saldo Final</span>
                <span
                  className={`font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(data.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

