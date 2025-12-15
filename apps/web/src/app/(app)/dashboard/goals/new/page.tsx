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
import { goalSchema } from '@finora/shared'

export default function NewGoalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    titulo: '',
    descricao: '',
    valor_objetivo: '',
    valor_atual: '0',
    prazo: '',
    status: 'ATIVA',
    aporte_mensal_sugerido: '',
    categoria: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validated = goalSchema.parse({
        titulo: formData.titulo,
        descricao: formData.descricao || undefined,
        valor_objetivo: parseFloat(formData.valor_objetivo),
        valor_atual: parseFloat(formData.valor_atual),
        prazo: formData.prazo || undefined,
        status: formData.status,
        aporte_mensal_sugerido: formData.aporte_mensal_sugerido
          ? parseFloat(formData.aporte_mensal_sugerido)
          : undefined,
        categoria: formData.categoria || undefined,
      })

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Meta criada!',
          description: 'A meta foi cadastrada com sucesso.',
        })
        router.push('/dashboard/goals')
      } else {
        throw new Error(data.error || 'Erro ao criar meta')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar meta. Tente novamente.',
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
          <h1 className="text-3xl font-bold tracking-tight">Nova Meta</h1>
          <p className="text-muted-foreground">Cadastre uma nova meta financeira</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Meta</CardTitle>
          <CardDescription>Preencha os dados da meta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                type="text"
                placeholder="Ex: Reserva de Emergência"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                type="text"
                placeholder="Descrição adicional..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_objetivo">Valor Objetivo (R$) *</Label>
                <Input
                  id="valor_objetivo"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor_objetivo}
                  onChange={(e) => setFormData({ ...formData, valor_objetivo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_atual">Valor Atual (R$)</Label>
                <Input
                  id="valor_atual"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor_atual}
                  onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aporte_mensal_sugerido">Aporte Mensal Sugerido (R$)</Label>
                <Input
                  id="aporte_mensal_sugerido"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.aporte_mensal_sugerido}
                  onChange={(e) =>
                    setFormData({ ...formData, aporte_mensal_sugerido: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Meta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

