import { ArrowRight, Bell, Check, Clock, MapPin, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReportsMap } from '@/components/ReportsMap'
import { useSectorClusters } from '@/lib/clusters'
import { Card, CardTitle, PageHeader, Pill } from '@/components/ui/Card'
import { formatDate, isToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import { ReportsTable } from './ReportsTable'

export function OfficerOverview() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const reports = useDemoStore((s) => s.reports)
  const alerts = useDemoStore((s) => s.alerts)
  const clusters = useSectorClusters(reports.filter((r) => r.status !== 'verified' || isRecent(r.reviewedAt)))
  const [sector, setSector] = useState<string>()

  const open = reports.filter((r) => r.status === 'pending' || r.status === 'needs_photo')
  const pending = reports.filter((r) => r.status === 'pending')
  const stats: { key: string; value: number; icon: LucideIcon; tone: string; to: string }[] = [
    { key: 'pending', value: pending.length, icon: Clock, tone: 'bg-harvest-100 text-harvest-700', to: '/officer/reports' },
    { key: 'verifiedToday', value: reports.filter((r) => r.status === 'verified' && isToday(r.reviewedAt)).length, icon: Check, tone: 'bg-brand-100 text-brand-700', to: '/officer/reports?status=verified' },
    { key: 'draftAlerts', value: alerts.filter((a) => a.status === 'draft').length, icon: Bell, tone: 'bg-harvest-100 text-harvest-700', to: '/officer/alerts' },
    { key: 'sectors', value: clusters.length, icon: MapPin, tone: 'bg-brand-100 text-brand-700', to: '/officer/map' },
  ]

  const next = pending[0]
  const tableRows = sector ? open.filter((r) => r.sector === sector) : open

  return (
    <div>
      <PageHeader
        title={t('officer.overview.title')}
        subtitle={t('officer.overview.subtitle')}
        aside={
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-forest-900">
            <Clock className="size-4 text-brand-600" />
            {formatDate(TODAY)}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {stats.map(({ key, value, icon: Icon, tone, to }) => (
          <Link key={key} to={to} className="rounded-3xl bg-white p-5 ring-1 ring-transparent transition hover:ring-brand-200">
            <p className="text-sm text-forest-700">{t(`officer.overview.stats.${key}`)}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-4xl font-bold text-forest-900">{value}</span>
              <span className={cn('grid size-11 place-items-center rounded-xl', tone)}>
                <Icon className="size-5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.75fr_1fr]">
        <Card className="p-4 sm:p-5">
          <CardTitle
            className="px-1"
            action={
              sector ? (
                <button onClick={() => setSector(undefined)} className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-semibold text-forest-800 hover:bg-brand-200">
                  {sector} ✕
                </button>
              ) : (
                <Pill tone="green">{user?.district ?? 'Musanze'}</Pill>
              )
            }
          >
            {t('officer.overview.mapTitle')}
          </CardTitle>
          <ReportsMap clusters={clusters} selected={sector} onSelect={(s) => setSector(s === sector ? undefined : s)} className="h-64" />
          <p className="mt-2 px-1 text-xs text-forest-600">{t('officer.overview.mapHint')}</p>
        </Card>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-brand-100 p-6">
          <div>
            <h2 className="text-2xl font-bold text-forest-900">{t('officer.overview.promoTitle')}</h2>
            <p className="mt-2 max-w-[16rem] text-forest-700">{t('officer.overview.promoBody')}</p>
          </div>
          <OfficerIllustration className="pointer-events-none absolute -bottom-2 right-0 h-48 opacity-90 sm:h-56" />
          {next ? (
            <Link
              to={`/officer/reports/${next.id}`}
              className="relative mt-8 inline-flex h-14 w-fit items-center gap-4 rounded-2xl bg-brand-600 px-5 font-semibold text-white transition hover:bg-brand-700"
            >
              {t('officer.overview.startReview')}
              <ArrowRight className="size-5" />
            </Link>
          ) : (
            <p className="relative mt-8 font-semibold text-brand-700">{t('officer.overview.allDone')}</p>
          )}
        </div>
      </div>

      <Card className="mt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h2 className="text-xl font-semibold text-forest-900">
            {t('officer.overview.queue')}
            {sector && <span className="ml-2 text-base font-normal text-forest-600">· {sector}</span>}
          </h2>
        </div>
        <div className="mt-4">
          <ReportsTable reports={tableRows} limit={5} />
        </div>
        <div className="mt-2 text-right">
          <Link to="/officer/reports" className="text-sm font-semibold text-brand-700 hover:underline">
            {t('officer.overview.seeAll')} →
          </Link>
        </div>
      </Card>

      <p className="mt-6 text-xs text-forest-600">{t('officer.overview.footer')}</p>
    </div>
  )
}

const TODAY = new Date().toISOString()

const isRecent = (iso?: string) => !!iso && Date.now() - new Date(iso).getTime() < 7 * 24 * 3600_000

function OfficerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={className} aria-hidden="true">
      <path d="M20 200 c4 -50 24 -80 60 -80 s56 30 60 80Z" fill="#254c38" />
      <path d="M60 124 l20 30 l20 -30" fill="#f6f5ee" />
      <rect x="70" y="100" width="20" height="24" rx="8" fill="#8a4b2f" />
      <circle cx="80" cy="76" r="30" fill="#a0583a" />
      <path d="M50 70 c0 -34 60 -38 62 -2 c-12 -12 -46 -14 -62 2Z" fill="#163f2d" />
      <path d="M68 90 q12 10 24 0" stroke="#163f2d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="69" cy="74" r="3" fill="#163f2d" />
      <circle cx="91" cy="74" r="3" fill="#163f2d" />
      <g transform="rotate(-14 45 165)">
        <rect x="22" y="130" width="46" height="62" rx="5" fill="#a0583a" />
        <rect x="27" y="138" width="36" height="50" rx="2" fill="#fbfaf5" />
        <rect x="36" y="126" width="18" height="9" rx="3" fill="#f2c957" />
        <path d="M33 152 l4 4 l8 -8 M33 168 l4 4 l8 -8" stroke="#2b7048" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M48 154 h10 M48 170 h10" stroke="#c6d8c7" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M60 170 c-10 -6 -18 -2 -20 4" stroke="#8a4b2f" strokeWidth="12" strokeLinecap="round" fill="none" />
    </svg>
  )
}
