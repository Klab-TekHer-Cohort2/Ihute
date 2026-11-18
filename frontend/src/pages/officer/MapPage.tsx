import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReportsMap } from '@/components/ReportsMap'
import { useSectorClusters } from '@/lib/clusters'
import { ReportStatusBadge } from '@/components/StatusBadge'
import { Card, PageHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'

export function MapPage() {
  const { t } = useTranslation()
  const reports = useDemoStore((s) => s.reports)
  const clusters = useSectorClusters(reports)
  const [sector, setSector] = useState<string | undefined>(clusters[0]?.sector)
  const inSector = reports.filter((r) => r.sector === sector && r.status !== 'rejected')

  return (
    <div>
      <PageHeader title={t('officer.map.title')} subtitle={t('officer.map.subtitle')} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-3 sm:p-4">
          <ReportsMap clusters={clusters} selected={sector} onSelect={setSector} className="h-[28rem] sm:h-[34rem]" />
          <div className="mt-3 flex flex-wrap gap-4 px-1 text-xs text-forest-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-harvest-400" /> {t('officer.map.legendVerified')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-harvest-200" /> {t('officer.map.legendPending')}
            </span>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-forest-900">{t('officer.map.sectors')}</h2>
            <ul className="space-y-1">
              {clusters.map((c) => (
                <li key={c.sector}>
                  <button
                    onClick={() => setSector(c.sector)}
                    aria-pressed={sector === c.sector}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition',
                      sector === c.sector ? 'bg-brand-100' : 'hover:bg-cream-100',
                    )}
                  >
                    <span className="font-medium text-forest-900">{c.sector}</span>
                    <span className="text-sm text-forest-600">
                      {t('officer.map.reportsCount', { count: c.count })} · {t('officer.map.verifiedCount', { count: c.verified })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {sector && (
            <Card>
              <h2 className="mb-3 text-lg font-semibold text-forest-900">{sector}</h2>
              <ul className="divide-y divide-cream-200">
                {inSector.map((r) => (
                  <li key={r.id}>
                    <Link to={`/officer/reports/${r.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-forest-900">
                          #{r.id} · {t(`crops.${r.crop}`)}
                        </p>
                        <p className="truncate text-xs text-forest-600">{r.confirmedDisease ?? r.ai.disease}</p>
                      </div>
                      <ReportStatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
