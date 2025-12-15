import { CardSkeleton } from '@/components/card-skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-80 rounded-md bg-muted animate-pulse" />
        <div className="h-80 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  )
}

