import { CardSkeleton } from '@/components/card-skeleton'
import { DataTableSkeleton } from '@/components/data-table-skeleton'

export default function DebtsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dívidas</h1>
          <p className="text-muted-foreground">Gerencie suas dívidas e empréstimos</p>
        </div>
        <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <DataTableSkeleton />
    </div>
  )
}

