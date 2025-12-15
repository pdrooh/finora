'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Circle, Wallet, TrendingUp, CreditCard, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Perfil', icon: Wallet },
  { id: 2, title: 'Rendas Extras', icon: TrendingUp },
  { id: 3, title: 'Dívidas', icon: CreditCard },
  { id: 4, title: 'Objetivos', icon: Target },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [checking, setChecking] = React.useState(true)

  // Check if onboarding is already completed
  React.useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (profile?.onboarding_completed) {
          // Already completed, redirect to dashboard
          router.push('/dashboard')
          return
        }

        setChecking(false)
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error)
        setChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  // Step 1: Profile
  const [profile, setProfile] = React.useState({
    tipo_renda: '',
    salario_fixo: '',
    frequencia_recebimento: '',
    dia_recebimento: '',
  })

  // Step 2: Extra Incomes
  const [extraIncomes, setExtraIncomes] = React.useState<
    Array<{ valor: string; frequencia: string; descricao: string }>
  >([])

  // Step 3: Debts
  const [debts, setDebts] = React.useState<
    Array<{
      nome: string
      tipo: string
      valor_total: string
      valor_restante: string
      parcela_mensal: string
      total_parcelas: string
      data_inicio: string
    }>
  >([])

  // Step 4: Goals
  const [goals, setGoals] = React.useState({
    financial_style: '',
    objectives: [] as string[],
  })

  const addExtraIncome = () => {
    setExtraIncomes([...extraIncomes, { valor: '', frequencia: 'MENSAL', descricao: '' }])
  }

  const removeExtraIncome = (index: number) => {
    setExtraIncomes(extraIncomes.filter((_, i) => i !== index))
  }

  const addDebt = () => {
    setDebts([
      ...debts,
      {
        nome: '',
        tipo: 'EMPRESTIMO',
        valor_total: '',
        valor_restante: '',
        parcela_mensal: '',
        total_parcelas: '',
        data_inicio: new Date().toISOString().split('T')[0],
      },
    ])
  }

  const removeDebt = (index: number) => {
    setDebts(debts.filter((_, i) => i !== index))
  }

  const toggleObjective = (objective: string) => {
    setGoals({
      ...goals,
      objectives: goals.objectives.includes(objective)
        ? goals.objectives.filter((o) => o !== objective)
        : [...goals.objectives, objective],
    })
  }

  const saveStep = async (step: number) => {
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

      if (step === 1) {
        // Verificar se o perfil existe
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        console.log('Verificando perfil existente:', { existingProfile, checkError })

        const profileData = {
          user_id: user.id,
          tipo_renda: profile.tipo_renda,
          salario_fixo: profile.salario_fixo ? parseFloat(profile.salario_fixo) : null,
          frequencia_recebimento: profile.frequencia_recebimento,
          dia_recebimento: profile.dia_recebimento ? parseInt(profile.dia_recebimento) : null,
          onboarding_step: 1,
        }

        let error
        if (existingProfile) {
          // Perfil existe, fazer UPDATE
          console.log('Perfil existe, fazendo UPDATE')
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('user_id', user.id)
          error = updateError
        } else {
          // Perfil não existe, fazer INSERT
          console.log('Perfil não existe, fazendo INSERT')
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)
          error = insertError
        }

        if (error) {
          console.error('Erro ao salvar perfil:', error)
          throw error
        }

        // Criar renda FIXO automaticamente se salário foi informado
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
            const { error: incomeError } = await supabase
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

            if (incomeError) {
              console.warn('Erro ao criar renda FIXO:', incomeError)
              // Não falha o onboarding se não conseguir criar a renda
            } else {
              console.log('Renda FIXO criada automaticamente:', salarioValor)
            }
          } else {
            // Atualizar renda existente
            const { error: updateIncomeError } = await supabase
              .from('incomes')
              .update({
                valor: salarioValor,
                recorrencia: frequencia,
              })
              .eq('id', existingIncome.id)

            if (updateIncomeError) {
              console.warn('Erro ao atualizar renda FIXO:', updateIncomeError)
            } else {
              console.log('Renda FIXO atualizada:', salarioValor)
            }
          }
        }
      } else if (step === 2) {
        // Save extra incomes
        for (const income of extraIncomes) {
          if (income.valor && income.descricao) {
            await supabase.from('incomes').insert({
              user_id: user.id,
              tipo: 'EXTRA',
              valor: parseFloat(income.valor),
              descricao: income.descricao,
              recorrencia: income.frequencia,
              data_inicio: new Date().toISOString().split('T')[0],
              ativo: true,
            })
          }
        }

        // Verificar se perfil existe e atualizar ou criar
        const { data: existingProfile2 } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        const step2Data = { user_id: user.id, onboarding_step: 2 }
        
        if (existingProfile2) {
          const { error } = await supabase
            .from('profiles')
            .update(step2Data)
            .eq('user_id', user.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('profiles')
            .insert(step2Data)
          if (error) throw error
        }
      } else if (step === 3) {
        // Save debts
        for (const debt of debts) {
          if (debt.nome && debt.valor_total) {
            await supabase.from('debts').insert({
              user_id: user.id,
              nome: debt.nome,
              tipo: debt.tipo,
              valor_total: parseFloat(debt.valor_total),
              valor_restante: parseFloat(debt.valor_restante || debt.valor_total),
              parcela_mensal: parseFloat(debt.parcela_mensal),
              total_parcelas: parseInt(debt.total_parcelas),
              parcela_atual: 1,
              data_inicio: debt.data_inicio,
              status: 'ATIVA',
            })
          }
        }

        // Verificar se perfil existe e atualizar ou criar
        const { data: existingProfile3 } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        const step3Data = { user_id: user.id, onboarding_step: 3 }
        
        if (existingProfile3) {
          const { error } = await supabase
            .from('profiles')
            .update(step3Data)
            .eq('user_id', user.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('profiles')
            .insert(step3Data)
          if (error) throw error
        }
      } else if (step === 4) {
        // Complete onboarding
        console.log('Completando onboarding...', {
          user_id: user.id,
          financial_style: goals.financial_style,
          objectives: goals.objectives,
        })

        // Verificar se o perfil existe
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .single()

        console.log('Perfil antes de completar:', { existingProfile, checkError })

        const updateData: any = {
          user_id: user.id,
          onboarding_completed: true,
          onboarding_step: 4,
        }

        if (goals.financial_style) {
          updateData.financial_style = goals.financial_style
        }

        if (goals.objectives && goals.objectives.length > 0) {
          updateData.objectives = goals.objectives
        }

        console.log('Dados a serem salvos:', updateData)

        let result
        if (existingProfile) {
          // Perfil existe, fazer UPDATE
          console.log('Perfil existe, fazendo UPDATE')
          result = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id)
            .select()
        } else {
          // Perfil não existe, fazer INSERT
          console.log('Perfil não existe, fazendo INSERT')
          result = await supabase
            .from('profiles')
            .insert(updateData)
            .select()
        }

        console.log('Resultado da operação:', result)

        if (result.error) {
          console.error('Erro ao salvar perfil:', result.error)
          toast({
            title: 'Erro ao salvar',
            description: result.error.message || 'Erro ao salvar dados do onboarding',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        // Verificar se realmente foi salvo
        const { data: verifyProfile, error: verifyError } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step, financial_style, objectives, user_id')
          .eq('user_id', user.id)
          .single()

        console.log('Verificação após salvar:', { verifyProfile, verifyError })

        if (verifyError) {
          console.error('Erro ao verificar perfil:', verifyError)
          toast({
            title: 'Aviso',
            description: 'Onboarding salvo, mas não foi possível verificar. Tente acessar o dashboard.',
            variant: 'default',
          })
        } else if (!verifyProfile?.onboarding_completed) {
          console.error('Perfil não foi atualizado corretamente:', verifyProfile)
          toast({
            title: 'Aviso',
            description: 'Pode ter havido um problema ao salvar. Tente novamente.',
            variant: 'default',
          })
        } else {
          toast({
            title: 'Onboarding concluído!',
            description: 'Redirecionando para o dashboard...',
          })
        }

        // Aguardar um pouco para garantir que o toast seja exibido e o banco seja atualizado
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Forçar reload completo para garantir que o middleware veja a atualização
        window.location.href = '/dashboard'
        return
      }

      setCurrentStep(step + 1)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="pt-6">
            <div className="text-center">Carregando...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo ao Finora!</CardTitle>
          <CardDescription className="text-center">
            Vamos configurar seu perfil financeiro em 4 passos simples
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-muted bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'h-1 flex-1 mx-2 rounded',
                        currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações do Perfil</h3>
                <div className="space-y-2">
                  <Label htmlFor="tipo_renda">Tipo de Renda *</Label>
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
                  <Label htmlFor="salario_fixo">Salário Fixo (R$) *</Label>
                  <Input
                    id="salario_fixo"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={profile.salario_fixo}
                    onChange={(e) => setProfile({ ...profile, salario_fixo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência *</Label>
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
                      placeholder="Ex: 5"
                      value={profile.dia_recebimento}
                      onChange={(e) => setProfile({ ...profile, dia_recebimento: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rendas Extras</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addExtraIncome}>
                    + Adicionar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adicione outras fontes de renda (freelances, investimentos, etc.)
                </p>
                {extraIncomes.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma renda extra adicionada</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={addExtraIncome}
                    >
                      Adicionar Primeira Renda Extra
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {extraIncomes.map((income, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4 space-y-2">
                              <Label>Descrição</Label>
                              <Input
                                value={income.descricao}
                                onChange={(e) => {
                                  const newIncomes = [...extraIncomes]
                                  newIncomes[index].descricao = e.target.value
                                  setExtraIncomes(newIncomes)
                                }}
                                placeholder="Ex: Freelance"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Valor (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={income.valor}
                                onChange={(e) => {
                                  const newIncomes = [...extraIncomes]
                                  newIncomes[index].valor = e.target.value
                                  setExtraIncomes(newIncomes)
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Frequência</Label>
                              <Select
                                value={income.frequencia}
                                onValueChange={(value) => {
                                  const newIncomes = [...extraIncomes]
                                  newIncomes[index].frequencia = value
                                  setExtraIncomes(newIncomes)
                                }}
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
                            <div className="col-span-12 md:col-span-2 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExtraIncome(index)}
                                className="text-destructive"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dívidas Existentes</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDebt}>
                    + Adicionar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Registre empréstimos, financiamentos e outras dívidas
                </p>
                {debts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma dívida registrada</p>
                    <Button type="button" variant="outline" className="mt-4" onClick={addDebt}>
                      Adicionar Primeira Dívida
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {debts.map((debt, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-6 space-y-2">
                              <Label>Nome da Dívida</Label>
                              <Input
                                value={debt.nome}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].nome = e.target.value
                                  setDebts(newDebts)
                                }}
                                placeholder="Ex: Financiamento Imóvel"
                              />
                            </div>
                            <div className="col-span-12 md:col-span-6 space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={debt.tipo}
                                onValueChange={(value) => {
                                  const newDebts = [...debts]
                                  newDebts[index].tipo = value
                                  setDebts(newDebts)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EMPRESTIMO">Empréstimo</SelectItem>
                                  <SelectItem value="FINANCIAMENTO">Financiamento</SelectItem>
                                  <SelectItem value="CARTÃO">Cartão de Crédito</SelectItem>
                                  <SelectItem value="OUTRO">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Valor Total (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={debt.valor_total}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].valor_total = e.target.value
                                  if (!debt.valor_restante) {
                                    newDebts[index].valor_restante = e.target.value
                                  }
                                  setDebts(newDebts)
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Valor Restante (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={debt.valor_restante}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].valor_restante = e.target.value
                                  setDebts(newDebts)
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Parcela Mensal (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={debt.parcela_mensal}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].parcela_mensal = e.target.value
                                  setDebts(newDebts)
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3 space-y-2">
                              <Label>Total de Parcelas</Label>
                              <Input
                                type="number"
                                value={debt.total_parcelas}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].total_parcelas = e.target.value
                                  setDebts(newDebts)
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div className="col-span-12 md:col-span-10 space-y-2">
                              <Label>Data de Início</Label>
                              <Input
                                type="date"
                                value={debt.data_inicio}
                                onChange={(e) => {
                                  const newDebts = [...debts]
                                  newDebts[index].data_inicio = e.target.value
                                  setDebts(newDebts)
                                }}
                              />
                            </div>
                            <div className="col-span-12 md:col-span-2 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDebt(index)}
                                className="text-destructive"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Objetivos Financeiros</h3>
                <div className="space-y-2">
                  <Label>Estilo Financeiro *</Label>
                  <Select
                    value={goals.financial_style}
                    onValueChange={(value) => setGoals({ ...goals, financial_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSERVATIVE">Conservador</SelectItem>
                      <SelectItem value="MODERATE">Moderado</SelectItem>
                      <SelectItem value="AGGRESSIVE">Agressivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Objetivos (selecione todos que se aplicam)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Reserva de Emergência',
                      'Quitar Dívidas',
                      'Comprar Imóvel',
                      'Investir',
                      'Viagem',
                      'Educação',
                      'Aposentadoria',
                      'Outro',
                    ].map((objective) => (
                      <Button
                        key={objective}
                        type="button"
                        variant={goals.objectives.includes(objective) ? 'default' : 'outline'}
                        onClick={() => toggleObjective(objective)}
                        className="justify-start"
                      >
                        {goals.objectives.includes(objective) && (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        {objective}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || loading}
              >
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => saveStep(currentStep)}
                disabled={loading}
              >
                {loading
                  ? 'Salvando...'
                  : currentStep === 4
                    ? 'Concluir'
                    : 'Próximo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

