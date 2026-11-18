import { FileText, Megaphone, RotateCcw, Sprout, UserCheck, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReportStatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle, PageHeader } from '@/components/ui/Card'
import { CROPS } from '@/lib/demo-data'
import { timeAgo } from '@/lib/format'
import { formatConfidence } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'

export function AdminOverview() {
  const { t } = useTranslation()
  const { reports, alerts, users, reset } = useDemoStore()

  const reviewed = reports.filter((r) => r.status === 'verified' || r.status === 'rejected')
  const agreed = reports.filter((r) => r.status === 'verified' && r.confirmedDisease === r.ai.disease).length
  const verifiedCount = reports.filter((r) => r.status === 'verified').length
  const agreement = verifiedCount ? agreed / verifiedCount : 0

  const stats: { key: string; value: string | number; icon: LucideIcon }[] = [
    { key: 'farmers', value: users.filter((u) => u.role === 'farmer' && u.active).length, icon: Sprout },
    { key: 'officers', value: users.filter((u) => u.role === 'officer' && u.active).length, icon: UserCheck },
    { key: 'reports', value: reports.length, icon: FileText },
    { key: 'alertsSent', value: alerts.filter((a) => a.status === 'sent').length, icon: Megaphone },
  ]

  const byCrop = CROPS.map((c) => ({ crop: c, count: reports.filter((r) => r.crop === c).length }))
  const maxCrop = Math.max(1, ...byCrop.map((b) => b.count))

  return (
    <div>
      <PageHeader
        title={t('admin.overview.title')}
        subtitle={t('admin.overview.subtitle')}
        aside={
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm(t('admin.overview.resetConfirm'))) reset()
            }}
          >
            <RotateCcw className="size-4" />
            {t('admin.overview.reset')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {stats.map(({ key, value, icon: Icon }) => (
          <div key={key} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-forest-700">{t(`admin.overview.stats.${key}`)}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-4xl font-bold text-forest-900">{value}</span>
              <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="size-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>{t('admin.overview.byCrop')}</CardTitle>
          <ul className="space-y-3">
            {byCrop.map(({ crop, count }) => (
              <li key={crop} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="text-forest-800">{t(`crops.${crop}`)}</span>
                <div className="h-3 overflow-hidden rounded-full bg-cream-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxCrop) * 100}%` }} />
                </div>
                <span className="text-right font-semibold tabular-nums text-forest-900">{count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{t('admin.overview.model')}</CardTitle>
          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-cream-100 p-4">
              <dt className="text-sm text-forest-600">{t('admin.overview.agreement')}</dt>
              <dd className="mt-1 text-3xl font-bold text-forest-900">{formatConfidence(agreement)}</dd>
            </div>
            <div className="rounded-2xl bg-cream-100 p-4">
              <dt className="text-sm text-forest-600">{t('admin.overview.reviewed')}</dt>
              <dd className="mt-1 text-3xl font-bold text-forest-900">
                {reviewed.length}/{reports.length}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-forest-600">{t('admin.overview.agreementHint')}</p>
        </Card>
      </div>

      <Card className="mt-5">
        <CardTitle action={<Link to="/admin/users" className="text-sm font-semibold text-brand-700 hover:underline">{t('nav.users')} →</Link>}>
          {t('admin.overview.recent')}
        </CardTitle>
        <ul className="divide-y divide-cream-200">
          {reports.slice(0, 6).map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-forest-900">
                  #{r.id} · {r.farmerName} · {t(`crops.${r.crop}`)}
                </p>
                <p className="text-xs text-forest-600">
                  {r.sector} · {timeAgo(r.submittedAt)}
                </p>
              </div>
              <ReportStatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
