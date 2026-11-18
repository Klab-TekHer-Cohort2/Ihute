import { CheckCircle2, Megaphone, Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { CropIcon } from '@/components/CropIcon'
import { AlertLevelBadge, AlertStatusBadge } from '@/components/StatusBadge'
import { EmptyState, PageHeader } from '@/components/ui/Card'
import { timeAgo } from '@/lib/format'
import { useDemoStore } from '@/stores/demo'

export function AlertsPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const flash = (location.state as { flash?: 'sent' | 'draft'; reach?: number } | null) ?? null
  const alerts = useDemoStore((s) => s.alerts)
  const drafts = alerts.filter((a) => a.status === 'draft')
  const sent = alerts.filter((a) => a.status === 'sent')

  return (
    <div>
      <PageHeader
        title={t('officer.alerts.title')}
        subtitle={t('officer.alerts.subtitle')}
        aside={
          <Link to="/officer/alerts/new" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">
            <Plus className="size-5" />
            {t('officer.alerts.new')}
          </Link>
        }
      />

      {flash?.flash && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl bg-brand-100 p-4 text-forest-900">
          <CheckCircle2 className="size-5 text-brand-600" />
          {flash.flash === 'sent' ? t('officer.alerts.flashSent', { count: flash.reach }) : t('officer.alerts.flashDraft')}
        </div>
      )}

      <Section title={t('officer.alerts.drafts')} count={drafts.length}>
        {drafts.length === 0 ? (
          <EmptyState icon={Megaphone} title={t('officer.alerts.noDrafts')} />
        ) : (
          drafts.map((a) => <AlertRow key={a.id} alert={a} />)
        )}
      </Section>

      <Section title={t('officer.alerts.sent')} count={sent.length}>
        {sent.map((a) => (
          <AlertRow key={a.id} alert={a} />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-forest-900">
        {title} <span className="text-forest-600">({count})</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function AlertRow({ alert: a }: { alert: import('@/types').Alert }) {
  const { t } = useTranslation()
  return (
    <Link to={`/officer/alerts/${a.id}`} className="flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-transparent transition hover:ring-brand-200 sm:p-5">
      <CropIcon crop={a.crop} className="size-12" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-semibold text-forest-900">{a.title}</p>
          <AlertLevelBadge level={a.level} />
        </div>
        <p className="mt-0.5 truncate text-sm text-forest-600">{a.message}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-forest-600">
          <span>
            {a.sector} · {a.radiusKm} km
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {t('alertForm.reach', { count: a.farmersReached })}
          </span>
          <span>{timeAgo(a.sentAt ?? a.createdAt)}</span>
        </p>
      </div>
      <AlertStatusBadge status={a.status} />
    </Link>
  )
}
