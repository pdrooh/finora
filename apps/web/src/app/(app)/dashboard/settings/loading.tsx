import { CardSkeleton } from '@/components/card-skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas configurações</p>
      </div>
      <CardSkeleton className="h-96" />
    </div>
  )
}

