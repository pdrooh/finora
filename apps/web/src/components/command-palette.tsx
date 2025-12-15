'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Plus, TrendingUp, TrendingDown, CreditCard, Target, BarChart3 } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Ações Rápidas">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/expenses/new'))}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            <span>Nova Despesa</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/incomes/new'))}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Nova Receita</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/debts/new'))}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Nova Dívida</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/goals/new'))}
          >
            <Target className="mr-2 h-4 w-4" />
            <span>Nova Meta</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/incomes'))}>
            <span>Receitas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/expenses'))}>
            <span>Despesas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/debts'))}>
            <span>Dívidas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/goals'))}>
            <span>Metas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/reports'))}>
            <span>Relatórios</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

