import { Bell, Camera, ChevronRight, Mic, ShieldCheck, Volume2, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CropIcon } from '@/components/CropIcon'
import { ReportStatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/Card'
import { CROPS } from '@/lib/demo-data'
import { firstName, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'

const ACTIONS: { key: string; to: string; icon: LucideIcon; tone: string }[] = [
  { key: 'photo', to: '/farmer/report', icon: Camera, tone: 'col-span-2 bg-brand-600 text-white hover:bg-brand-700 lg:col-span-1' },
  { key: 'voice', to: '/farmer/assistant', icon: Mic, tone: 'bg-[#f6e9d3] text-forest-900 hover:bg-[#f1dfc0]' },
  { key: 'alerts', to: '/farmer/alerts', icon: Bell, tone: 'bg-white text-forest-900 hover:ring-brand-300' },
]

export function FarmerHome() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const reports = useDemoStore((s) => s.reports)
  const alerts = useDemoStore((s) => s.alerts)
  const [showHow, setShowHow] = useState(false)

  const name = user ? firstName(user.fullName) : ''
  const myReports = reports.filter((r) => firstName(r.farmerName) === name).slice(0, 3)
  const sent = alerts.filter((a) => a.status === 'sent')
  const nearby = sent.find((a) => a.sector === user?.sector) ?? sent[0]

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-100">
        <div className="grid items-center md:grid-cols-[1.4fr_1fr]">
          <div className="relative z-10 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t('farmer.home.greeting', { name })}</p>
            <h1 className="mt-3 max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-forest-900 sm:text-5xl">
              {t('farmer.home.title')}
            </h1>
            <button
              onClick={() => setShowHow((v) => !v)}
              aria-expanded={showHow}
              className="mt-7 inline-flex h-14 items-center gap-3 rounded-2xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700"
            >
              {showHow ? <X className="size-5" /> : <Volume2 className="size-5" />}
              {t('farmer.home.howItWorks')}
            </button>
          </div>
          <FarmerIllustration className="hidden h-full md:block" />
        </div>

        {showHow && (
          <ol className="relative z-10 grid gap-3 border-t border-brand-200 bg-brand-50/70 p-6 sm:grid-cols-3 sm:p-8">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{n}</span>
                <div>
                  <p className="font-semibold text-forest-900">{t(`farmer.home.steps.${n}.title`)}</p>
                  <p className="text-sm text-forest-600">{t(`farmer.home.steps.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-2xl font-bold text-forest-900">{t('farmer.home.helpToday')}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {ACTIONS.map(({ key, to, icon: Icon, tone }) => (
            <Link
              key={key}
              to={to}
              className={cn('flex min-h-40 flex-col justify-between rounded-3xl p-5 ring-1 ring-transparent transition sm:min-h-48 sm:p-6', tone)}
            >
              <Icon className="size-8" strokeWidth={1.5} />
              <div>
                <p className="text-lg font-semibold sm:text-xl">{t(`farmer.home.actions.${key}.title`)}</p>
                <p className="mt-1 text-sm opacity-85">{t(`farmer.home.actions.${key}.body`)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Crops */}
      <section>
        <h2 className="text-2xl font-bold text-forest-900">{t('farmer.home.myCrops')}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CROPS.map((crop) => (
            <Link
              key={crop}
              to={`/farmer/report?crop=${crop}`}
              className="group flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-transparent transition hover:ring-brand-300 sm:p-5"
              title={t('farmer.home.reportCrop', { crop: t(`crops.${crop}`) })}
            >
              <CropIcon crop={crop} className="size-12 sm:size-16" />
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight text-forest-900">{t(`crops.${crop}`)}</p>
                <p className="text-sm text-forest-600">{t(`cropsLatin.${crop}`)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* My reports — so farmers can see what the officer decided */}
      {myReports.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-forest-900">{t('farmer.home.myReports')}</h2>
          </div>
          <Card className="mt-4 divide-y divide-cream-200 p-0 sm:p-0">
            {myReports.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4 sm:px-6">
                <CropIcon crop={r.crop} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-900">{r.confirmedDisease ?? r.ai.disease}</p>
                  <p className="text-sm text-forest-600">
                    {t(`crops.${r.crop}`)} · {timeAgo(r.submittedAt)}
                  </p>
                  {r.officerAdvice && <p className="mt-1 text-sm text-forest-800">{r.officerAdvice}</p>}
                </div>
                <ReportStatusBadge status={r.status} />
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Nearby alert banner */}
      {nearby && (
        <section className="flex flex-col gap-4 rounded-3xl bg-harvest-100 p-5 sm:flex-row sm:items-center sm:px-8">
          <ShieldCheck className="size-7 shrink-0 text-harvest-700" />
          <div className="flex-1">
            <p className="text-lg font-semibold text-harvest-700">
              {nearby.title} · {nearby.sector}
            </p>
            <p className="text-sm text-harvest-700/90">
              {t('farmer.home.alertMeta', { km: nearby.radiusKm })} · {t('common.demoShort')}
            </p>
          </div>
          <Link
            to="/farmer/alerts"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-semibold text-forest-900 transition hover:bg-cream-50"
          >
            <Volume2 className="size-5" />
            {t('farmer.home.openAlert')}
            <ChevronRight className="size-4" />
          </Link>
        </section>
      )}
    </div>
  )
}

/** Farmer checking her crops on a phone, drawn in the palette (design 10 hero). */
function FarmerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 310" className={className} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="440" height="310" fill="#e5ede0" />
      <circle cx="350" cy="58" r="14" fill="#f2c957" />
      <path d="M0 170 C90 120 180 140 260 120 S400 100 440 110 V310 H0Z" fill="#c6d8c7" />
      <path d="M0 210 C110 170 220 190 320 165 S420 160 440 165 V310 H0Z" fill="#a8c5af" />
      <path d="M0 250 C120 225 260 240 440 220 V310 H0Z" fill="#3e7e57" />
      <ellipse cx="170" cy="282" rx="80" ry="10" fill="#254c38" opacity=".55" />
      <ellipse cx="350" cy="276" rx="56" ry="9" fill="#a0583a" />

      {/* maize plant */}
      <path d="M300 272 V120" stroke="#2b7048" strokeWidth="5" />
      <path d="M300 230 C270 215 255 190 250 175 C272 182 292 200 300 220" fill="#2b7048" />
      <path d="M300 200 C330 185 345 165 352 150 C330 156 310 172 300 190" fill="#3e7e57" />
      <path d="M300 165 C275 150 262 132 258 118 C280 126 296 142 300 158" fill="#2b7048" />
      <ellipse cx="308" cy="186" rx="6" ry="16" fill="#f2c957" />
      <path d="M300 120 l-8 -18 M300 120 l0 -22 M300 120 l8 -18" stroke="#f2c957" strokeWidth="4" strokeLinecap="round" />
      {/* small plants */}
      {[350, 385].map((x) => (
        <g key={x} transform={`translate(${x} 272)`}>
          <path d="M0 0 V-46" stroke="#2b7048" strokeWidth="3" />
          {[-14, -26, -38].map((y, i) => (
            <path
              key={y}
              d={`M0 ${y} C22 ${y - 6} 28 ${y - 16} 28 ${y - 16} C12 ${y - 16} 0 ${y - 8} 0 ${y}Z`}
              transform={i % 2 ? 'scale(-1 1)' : undefined}
              fill="#3e7e57"
            />
          ))}
        </g>
      ))}

      {/* farmer */}
      <path d="M150 282 l8 -78 h22 l-6 78Z" fill="#163f2d" />
      <path d="M178 282 l4 -78 h20 l4 78Z" fill="#254c38" />
      <path d="M140 210 c0 -40 14 -66 46 -66 s44 26 44 66Z" fill="#f2c957" />
      <path d="M222 168 l28 -22" stroke="#8a4b2f" strokeWidth="12" strokeLinecap="round" />
      <rect x="244" y="118" width="22" height="36" rx="4" fill="#163f2d" />
      <rect x="248" y="123" width="14" height="22" rx="2" fill="#c6d8c7" />
      <path d="M150 170 l-8 40" stroke="#8a4b2f" strokeWidth="12" strokeLinecap="round" />
      <rect x="176" y="126" width="16" height="20" rx="6" fill="#8a4b2f" />
      <circle cx="184" cy="108" r="24" fill="#a0583a" />
      <path d="M160 102 c2 -22 44 -26 50 -4 c-10 -8 -36 -10 -50 4Z" fill="#163f2d" />
      <circle cx="172" cy="84" r="10" fill="#163f2d" />
      <path d="M178 118 q8 6 16 0" stroke="#163f2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="176" cy="104" r="2.3" fill="#163f2d" />
      <circle cx="194" cy="104" r="2.3" fill="#163f2d" />
    </svg>
  )
}
