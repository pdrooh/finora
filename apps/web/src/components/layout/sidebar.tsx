'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
  BarChart3,
  Settings,
  Wallet,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { QuickAdd } from '@/components/quick-add'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Receitas', href: '/dashboard/incomes', icon: TrendingUp },
  { name: 'Despesas', href: '/dashboard/expenses', icon: TrendingDown },
  { name: 'Dívidas', href: '/dashboard/debts', icon: CreditCard },
  { name: 'Metas', href: '/dashboard/goals', icon: Target },
  { name: 'Relatórios', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn(
        "relative flex h-16 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Finora</span>
          </div>
        ) : (
          <Wallet className="h-6 w-6 text-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            collapsed && "absolute right-0 top-0 h-16 w-16"
          )}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          // Melhor lógica para determinar item ativo
          // Dashboard só é ativo se for exatamente /dashboard
          // Outros itens são ativos se o pathname começar com o href
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Quick Add na sidebar */}
      <div className="border-t p-4">
        <QuickAdd collapsed={collapsed} />
      </div>
    </div>
  )
}

