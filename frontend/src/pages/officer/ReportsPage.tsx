import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Card, PageHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'
import type { ReportStatus } from '@/types'
import { ReportsTable } from './ReportsTable'

const TABS: (ReportStatus | 'all')[] = ['pending', 'needs_photo', 'verified', 'rejected', 'all']

export function ReportsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const reports = useDemoStore((s) => s.reports)
  const raw = params.get('status')
  const status = (TABS as string[]).includes(raw ?? '') ? (raw as (typeof TABS)[number]) : 'pending'
  const rows = status === 'all' ? reports : reports.filter((r) => r.status === status)

  return (
    <div>
      <PageHeader title={t('officer.reports.title')} subtitle={t('officer.reports.subtitle')} />
      <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((s) => {
          const count = s === 'all' ? reports.length : reports.filter((r) => r.status === s).length
          return (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              onClick={() => setParams(s === 'pending' ? {} : { status: s }, { replace: true })}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition',
                status === s ? 'bg-forest-900 text-white' : 'bg-white text-forest-700 hover:bg-brand-50',
              )}
            >
              {s === 'all' ? t('officer.reports.all') : t(`reportStatus.${s}`)}
              <span className="ml-2 opacity-70">{count}</span>
            </button>
          )
        })}
      </div>
      <Card>
        <ReportsTable key={status} reports={rows} />
      </Card>
    </div>
  )
}
