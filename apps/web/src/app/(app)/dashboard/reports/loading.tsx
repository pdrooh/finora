import { CardSkeleton } from '@/components/card-skeleton'

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Visualize seus relatórios financeiros</p>
        </div>
        <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}

