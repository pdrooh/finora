'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, User, CreditCard, Bell, Shield } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@finora/shared'

export function SettingsClient({
  initialProfile,
  initialCategories,
}: {
  initialProfile: any
  initialCategories: Category[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState(initialCategories)
  const [profile, setProfile] = React.useState({
    tipo_renda: initialProfile?.tipo_renda || '',
    salario_fixo: initialProfile?.salario_fixo?.toString() || '',
    frequencia_recebimento: initialProfile?.frequencia_recebimento || '',
    dia_recebimento: initialProfile?.dia_recebimento?.toString() || '',
    financial_style: initialProfile?.financial_style || '',
    currency: initialProfile?.currency || 'BRL',
    timezone: initialProfile?.timezone || 'America/Sao_Paulo',
  })
  const [newCategory, setNewCategory] = React.useState({ name: '', icon: '', color: '#FF6B6B' })

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          tipo_renda: profile.tipo_renda || null,
          salario_fixo: profile.salario_fixo ? parseFloat(profile.salario_fixo) : null,
          frequencia_recebimento: profile.frequencia_recebimento || null,
          dia_recebimento: profile.dia_recebimento ? parseInt(profile.dia_recebimento) : null,
          financial_style: profile.financial_style || null,
          currency: profile.currency,
          timezone: profile.timezone,
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Criar/atualizar renda FIXO automaticamente se salário foi informado
      if (profile.salario_fixo && parseFloat(profile.salario_fixo) > 0) {
        const salarioValor = parseFloat(profile.salario_fixo)
        const frequencia = profile.frequencia_recebimento || 'MENSAL'
        
        // Verificar se já existe uma renda FIXO para este mês
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        const { data: existingIncome } = await supabase
          .from('incomes')
          .select('id')
          .eq('user_id', user.id)
          .eq('tipo', 'FIXO')
          .eq('month_key', currentMonth)
          .single()

        if (!existingIncome) {
          // Criar renda FIXO
          await supabase
            .from('incomes')
            .insert({
              user_id: user.id,
              tipo: 'FIXO',
              valor: salarioValor,
              descricao: 'Salário Fixo',
              recorrencia: frequencia,
              data_inicio: new Date().toISOString().split('T')[0],
              ativo: true,
            })
        } else {
          // Atualizar renda existente
          await supabase
            .from('incomes')
            .update({
              valor: salarioValor,
              recorrencia: frequencia,
            })
            .eq('id', existingIncome.id)
        }
      }

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas configurações foram salvas com sucesso.',
      })
      
      // Recarregar a página para atualizar os dados
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da categoria é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategory.name,
          icon: newCategory.icon || null,
          color: newCategory.color,
          is_default: false,
          is_income: false,
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setNewCategory({ name: '', icon: '', color: '#FF6B6B' })
      toast({
        title: 'Categoria criada!',
        description: 'A categoria foi adicionada com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar categoria',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, isDefault: boolean) => {
    if (isDefault) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir categorias padrão',
        variant: 'destructive',
      })
      return
    }

    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return
    }

    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('categories').delete().eq('id', categoryId)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== categoryId))
      toast({
        title: 'Categoria excluída!',
        description: 'A categoria foi removida com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir categoria',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const userCategories = categories.filter((c) => !c.is_default)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="categories">
            <CreditCard className="mr-2 h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações financeiras</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_renda">Tipo de Renda</Label>
                  <Select
                    value={profile.tipo_renda}
                    onValueChange={(value) => setProfile({ ...profile, tipo_renda: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="MISTO">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salario_fixo">Salário Fixo (R$)</Label>
                  <Input
                    id="salario_fixo"
                    type="number"
                    step="0.01"
                    value={profile.salario_fixo}
                    onChange={(e) => setProfile({ ...profile, salario_fixo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencia_recebimento">Frequência de Recebimento</Label>
                  <Select
                    value={profile.frequencia_recebimento}
                    onValueChange={(value) =>
                      setProfile({ ...profile, frequencia_recebimento: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MENSAL">Mensal</SelectItem>
                      <SelectItem value="QUINZENAL">Quinzenal</SelectItem>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dia_recebimento">Dia de Recebimento</Label>
                  <Input
                    id="dia_recebimento"
                    type="number"
                    min="1"
                    max="31"
                    value={profile.dia_recebimento}
                    onChange={(e) => setProfile({ ...profile, dia_recebimento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial_style">Estilo Financeiro</Label>
                  <Select
                    value={profile.financial_style}
                    onValueChange={(value) => setProfile({ ...profile, financial_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSERVATIVE">Conservador</SelectItem>
                      <SelectItem value="MODERATE">Moderado</SelectItem>
                      <SelectItem value="AGGRESSIVE">Agressivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value) => setProfile({ ...profile, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (Real)</SelectItem>
                      <SelectItem value="USD">USD (Dólar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias Personalizadas</CardTitle>
              <CardDescription>Gerencie suas categorias de despesas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="new_category_name">Nome da Categoria *</Label>
                  <Input
                    id="new_category_name"
                    placeholder="Ex: Viagem"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_category_icon">Ícone (emoji)</Label>
                  <Input
                    id="new_category_icon"
                    placeholder="✈️"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_category_color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new_category_color"
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-20"
                    />
                    <Button onClick={handleAddCategory} disabled={loading} className="flex-1">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Categorias Padrão</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories
                    .filter((c) => c.is_default)
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Padrão
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              {userCategories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Suas Categorias</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {userCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id, category.is_default)}
                          className="h-6 w-6 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input id="current_password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input id="new_password" type="password" placeholder="••••••••" />
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                <Input id="confirm_password" type="password" placeholder="••••••••" />
              </div>
              <Button disabled>
                <Shield className="mr-2 h-4 w-4" />
                Atualizar Senha
              </Button>
              <p className="text-xs text-muted-foreground">
                Funcionalidade de alteração de senha em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

