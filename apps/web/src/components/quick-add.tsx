'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, CreditCard, Target, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { Category } from '@finora/shared'
import { cn } from '@/lib/utils'

export function QuickAdd({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [type, setType] = React.useState<'income' | 'expense' | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [formData, setFormData] = React.useState({
    descricao: '',
    valor: '',
    category_id: '',
    data: new Date().toISOString().split('T')[0],
  })

  React.useEffect(() => {
    if (open && type === 'expense') {
      loadCategories()
    }
  }, [open, type])

  const loadCategories = async () => {
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
      .limit(10)

    if (!error && data) {
      setCategories(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = type === 'income' ? '/api/incomes' : '/api/expenses'
      const payload =
        type === 'income'
          ? {
              tipo: 'EXTRA',
              valor: parseFloat(formData.valor),
              descricao: formData.descricao,
              data_inicio: formData.data,
              ativo: true,
            }
          : {
              category_id: formData.category_id,
              tipo: 'VARIAVEL',
              valor: parseFloat(formData.valor),
              descricao: formData.descricao,
              data: formData.data,
              is_recurring: false,
            }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: type === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!',
          description: 'O lançamento foi registrado com sucesso.',
        })
        setOpen(false)
        setType(null)
        setFormData({
          descricao: '',
          valor: '',
          category_id: '',
          data: new Date().toISOString().split('T')[0],
        })
        router.refresh()
      } else {
        throw new Error(data.error || 'Erro ao adicionar')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar lançamento.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      label: 'Nova Receita',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-950/40',
      onClick: () => {
        setType('income')
        setOpen(true)
      },
    },
    {
      label: 'Nova Despesa',
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-950/40',
      onClick: () => {
        setType('expense')
        setOpen(true)
      },
    },
    {
      label: 'Nova Dívida',
      icon: CreditCard,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-950/40',
      onClick: () => router.push('/dashboard/debts/new'),
    },
    {
      label: 'Nova Meta',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-950/40',
      onClick: () => router.push('/dashboard/goals/new'),
    },
  ]

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full h-11 transition-all duration-200",
              "bg-gradient-to-r from-primary to-primary/90",
              "hover:from-primary/95 hover:to-primary/85",
              "shadow-md hover:shadow-lg",
              popoverOpen && "bg-primary/95",
              collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
            )}
            title={collapsed ? "Ações Rápidas" : undefined}
          >
            <Plus className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-semibold">Ações Rápidas</span>}
          </Button>
        </PopoverTrigger>
          <PopoverContent 
            side="right" 
            align="start"
            className="w-64 p-3 ml-2 shadow-2xl border-2 bg-background/95 backdrop-blur-sm"
          >
            <div className="space-y-2">
              <div className="px-2 py-1.5 mb-1 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações Rápidas
                </p>
              </div>
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick()
                      setPopoverOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "transition-all duration-200 ease-out",
                      "border border-border/50",
                      action.bgColor,
                      action.hoverColor,
                      "hover:border-border hover:shadow-md",
                      "active:scale-[0.98]",
                      "group cursor-pointer"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-lg",
                      "transition-all duration-200",
                      action.bgColor,
                      "group-hover:scale-110 group-hover:shadow-sm",
                      "border border-border/30"
                    )}>
                      <Icon className={cn("h-5 w-5", action.color)} />
                    </div>
                    <span className="font-semibold text-sm flex-1 text-left group-hover:translate-x-0.5 transition-transform">
                      {action.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

      <Dialog open={open && type !== null} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(false)
          setType(null)
          setFormData({
            descricao: '',
            valor: '',
            category_id: '',
            data: new Date().toISOString().split('T')[0],
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {type === 'income' ? 'Nova Receita Rápida' : 'Nova Despesa Rápida'}
            </DialogTitle>
            <DialogDescription>
              Adicione um lançamento rápido sem sair da página atual
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Almoço"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            {type === 'expense' && (
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
            )}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setType(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

