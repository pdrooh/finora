'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { expenseSchema, parceledExpenseSchema, type Category } from '@finora/shared'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function NewExpensePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [formData, setFormData] = React.useState({
    category_id: '',
    tipo: 'VARIAVEL',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    recorrencia: 'MENSAL',
    is_recurring: 'false',
    total_installments: '',
    data_inicio: new Date().toISOString().split('T')[0],
  })

  React.useEffect(() => {
    async function loadCategories() {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`is_default.eq.true,user_id.eq.${user.id}`)
        .eq('is_income', false)
        .order('name')

      if (!error && data) {
        setCategories(data)
      }
    }

    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let validated

      if (formData.tipo === 'PARCELADA') {
        validated = parceledExpenseSchema.parse({
          category_id: formData.category_id,
          tipo: formData.tipo,
          valor: parseFloat(formData.valor),
          descricao: formData.descricao,
          data: formData.data,
          is_recurring: false,
          total_installments: parseInt(formData.total_installments),
          data_inicio: formData.data_inicio,
        })
      } else {
        validated = expenseSchema.parse({
          category_id: formData.category_id,
          tipo: formData.tipo,
          valor: parseFloat(formData.valor),
          descricao: formData.descricao,
          data: formData.data,
          recorrencia: formData.recorrencia || undefined,
          is_recurring: formData.is_recurring === 'true',
        })
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validated,
          total_installments: formData.tipo === 'PARCELADA' ? formData.total_installments : undefined,
          data_inicio: formData.tipo === 'PARCELADA' ? formData.data_inicio : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Despesa criada!',
          description: 'A despesa foi cadastrada com sucesso.',
        })
        router.push('/dashboard/expenses')
      } else {
        throw new Error(data.error || 'Erro ao criar despesa')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar despesa. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Despesa</h1>
          <p className="text-muted-foreground">Cadastre uma nova despesa</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Despesa</CardTitle>
          <CardDescription>Preencha os dados da despesa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Despesa *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXA">Fixa (Recorrente)</SelectItem>
                    <SelectItem value="VARIAVEL">Variável (Eventual)</SelectItem>
                    <SelectItem value="PARCELADA">Parcelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                type="text"
                placeholder="Ex: Supermercado"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>

            {formData.tipo === 'FIXA' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recorrencia">Recorrência</Label>
                  <Select
                    value={formData.recorrencia}
                    onValueChange={(value) => setFormData({ ...formData, recorrencia: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MENSAL">Mensal</SelectItem>
                      <SelectItem value="QUINZENAL">Quinzenal</SelectItem>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                      <SelectItem value="ANUAL">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_recurring">Recorrente</Label>
                  <Select
                    value={formData.is_recurring}
                    onValueChange={(value) => setFormData({ ...formData, is_recurring: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.tipo === 'PARCELADA' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_installments">Número de Parcelas *</Label>
                  <Input
                    id="total_installments"
                    type="number"
                    min="2"
                    max="120"
                    placeholder="Ex: 12"
                    value={formData.total_installments}
                    onChange={(e) =>
                      setFormData({ ...formData, total_installments: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data da Primeira Parcela *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Despesa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

