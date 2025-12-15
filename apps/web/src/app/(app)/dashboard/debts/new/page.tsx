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
import { debtSchema } from '@finora/shared'

export default function NewDebtPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    nome: '',
    tipo: 'EMPRESTIMO',
    valor_total: '',
    valor_restante: '',
    taxa_juros: '0',
    tipo_juros: 'SIMPLE',
    parcela_mensal: '',
    total_parcelas: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    status: 'ATIVA',
    observacoes: '',
  })

  React.useEffect(() => {
    // Auto-calculate valor_restante if not set
    if (formData.valor_total && !formData.valor_restante) {
      setFormData((prev) => ({ ...prev, valor_restante: prev.valor_total }))
    }
  }, [formData.valor_total])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validated = debtSchema.parse({
        nome: formData.nome,
        tipo: formData.tipo,
        valor_total: parseFloat(formData.valor_total),
        valor_restante: parseFloat(formData.valor_restante || formData.valor_total),
        taxa_juros: parseFloat(formData.taxa_juros),
        tipo_juros: formData.tipo_juros,
        parcela_mensal: parseFloat(formData.parcela_mensal),
        total_parcelas: parseInt(formData.total_parcelas),
        data_inicio: formData.data_inicio,
        data_vencimento: formData.data_vencimento || undefined,
        status: formData.status,
        observacoes: formData.observacoes || undefined,
      })

      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Dívida criada!',
          description: 'A dívida foi cadastrada com sucesso.',
        })
        router.push('/dashboard/debts')
      } else {
        throw new Error(data.error || 'Erro ao criar dívida')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar dívida. Tente novamente.',
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
          <h1 className="text-3xl font-bold tracking-tight">Nova Dívida</h1>
          <p className="text-muted-foreground">Cadastre uma nova dívida ou empréstimo</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Dívida</CardTitle>
          <CardDescription>Preencha os dados da dívida</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Dívida *</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Financiamento Imóvel"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPRESTIMO">Empréstimo</SelectItem>
                    <SelectItem value="FINANCIAMENTO">Financiamento</SelectItem>
                    <SelectItem value="CARTÃO">Cartão de Crédito</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_total">Valor Total (R$) *</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_restante">Valor Restante (R$) *</Label>
                <Input
                  id="valor_restante"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor_restante}
                  onChange={(e) => setFormData({ ...formData, valor_restante: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxa_juros">Taxa de Juros (%)</Label>
                <Input
                  id="taxa_juros"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.taxa_juros}
                  onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcela_mensal">Parcela Mensal (R$) *</Label>
                <Input
                  id="parcela_mensal"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.parcela_mensal}
                  onChange={(e) => setFormData({ ...formData, parcela_mensal: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_parcelas">Total de Parcelas *</Label>
                <Input
                  id="total_parcelas"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.total_parcelas}
                  onChange={(e) => setFormData({ ...formData, total_parcelas: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_juros">Tipo de Juros</Label>
                <Select
                  value={formData.tipo_juros}
                  onValueChange={(value) => setFormData({ ...formData, tipo_juros: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simples</SelectItem>
                    <SelectItem value="COMPOUND">Composto</SelectItem>
                    <SelectItem value="FIXED">Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                type="text"
                placeholder="Informações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Dívida'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

