import { BellOff, MapPin, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CropIcon } from '@/components/CropIcon'
import { AlertLevelBadge } from '@/components/StatusBadge'
import { EmptyState, PageHeader } from '@/components/ui/Card'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'

export function FarmerAlerts() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const alerts = useDemoStore((s) => s.alerts)
  const sent = alerts
    .filter((a) => a.status === 'sent')
    .sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''))

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('farmer.alerts.title')} subtitle={t('farmer.alerts.subtitle')} />

      {sent.length === 0 ? (
        <EmptyState icon={BellOff} title={t('farmer.alerts.empty')} />
      ) : (
        <ul className="space-y-4">
          {sent.map((a) => {
            const mine = a.sector === user?.sector
            return (
              <li key={a.id} className={cn('rounded-3xl p-5 sm:p-6', mine ? 'bg-harvest-100' : 'bg-white')}>
                <div className="flex items-start gap-4">
                  <CropIcon crop={a.crop} className="size-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className={cn('text-xl font-bold', mine ? 'text-harvest-700' : 'text-forest-900')}>{a.title}</h2>
                      <AlertLevelBadge level={a.level} />
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-forest-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {a.sector} · {t('farmer.alerts.radius', { km: a.radiusKm })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {t('farmer.alerts.verifiedBy')}
                      </span>
                      <span>{a.sentAt && timeAgo(a.sentAt)}</span>
                    </p>
                    <p className="mt-3 text-[17px] leading-relaxed text-forest-900">{a.message}</p>
                    {mine && <p className="mt-3 text-xs font-semibold text-harvest-700">{t('farmer.alerts.nearYou')}</p>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
