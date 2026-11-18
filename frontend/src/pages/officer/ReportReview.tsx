import { Camera, Check, CheckCircle2, Clock, FileQuestion, Megaphone, ShieldCheck, Volume2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ReportPhoto } from '@/components/ReportPhoto'
import { ReportStatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle, EmptyState, PageHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { DISEASES } from '@/lib/demo-data'
import { formatDateTime, formatTime } from '@/lib/format'
import { cn, formatConfidence } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'
import type { FieldReport, ReportStatus } from '@/types'

export function ReportReview() {
  const { id } = useParams()
  // keyed so the decision form resets when moving to another report
  return <ReviewInner key={id} id={id} />
}

function ReviewInner({ id }: { id?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const report = useDemoStore((s) => s.reports.find((r) => r.id === id))
  const pendingIds = useDemoStore((s) => s.reports.filter((r) => r.status === 'pending').map((r) => r.id).join(','))
  const updateReport = useDemoStore((s) => s.updateReport)

  const [disease, setDisease] = useState(report?.confirmedDisease ?? report?.ai.disease ?? '')
  const [advice, setAdvice] = useState(report?.officerAdvice ?? t('review.defaultAdvice'))
  const [voice, setVoice] = useState(report?.sendAsVoice ?? true)

  if (!report) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={t('review.notFound')}
        action={<Link to="/officer/reports" className="font-semibold text-brand-700 underline">{t('review.back')}</Link>}
      />
    )
  }

  const decide = (status: ReportStatus) => {
    updateReport(report.id, {
      status,
      confirmedDisease: status === 'verified' ? disease : undefined,
      officerAdvice: advice.trim() || undefined,
      sendAsVoice: voice,
      reviewedAt: new Date().toISOString(),
    })
  }

  const nextPending = pendingIds.split(',').find((x) => x && x !== report.id)
  const options = [...new Set([report.ai.disease, ...DISEASES[report.crop]])]
  const decided = report.status !== 'pending'

  return (
    <div>
      <PageHeader
        back={{ to: '/officer/reports', label: t('review.back') }}
        title={t('review.title', { id: report.id })}
        aside={<ReportStatusBadge status={report.status} />}
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardTitle>{t('review.farmerPhoto')}</CardTitle>
            <ReportPhoto report={report} className="aspect-[2/1]" />
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="sr-only">{t('review.farmer')}</dt>
                <dd className="text-lg font-semibold text-forest-900">{report.farmerName}</dd>
                <dd className="text-sm text-forest-600">
                  {report.sector} · {report.district}
                </dd>
              </div>
              <div>
                <dt className="sr-only">{t('review.crop')}</dt>
                <dd className="text-lg font-semibold text-forest-900">{t(`crops.${report.crop}`)}</dd>
                <dd className="text-sm text-forest-600">{formatDateTime(report.submittedAt)}</dd>
              </div>
            </dl>
            {report.description && (
              <blockquote className="mt-4 rounded-2xl bg-cream-100 p-4 text-sm text-forest-800">“{report.description}”</blockquote>
            )}
          </Card>

          <Card>
            <CardTitle>{t('review.timeline')}</CardTitle>
            <Timeline report={report} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>{t('review.aiSaw')}</CardTitle>
            <p className="text-2xl font-bold text-forest-900">{report.ai.disease}</p>
            <span className="mt-3 inline-block rounded-lg bg-harvest-100 px-3 py-1 text-xs font-semibold text-harvest-700">
              {formatConfidence(report.ai.confidence)} · {t('review.notConfirmed')}
            </span>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-cream-200" role="meter" aria-valuenow={Math.round(report.ai.confidence * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={t('review.confidence')}>
              <div className="h-full rounded-full bg-harvest-400" style={{ width: formatConfidence(report.ai.confidence) }} />
            </div>
            <p className="mt-5 text-sm text-forest-600">{t('review.alternatives')}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 text-forest-900">
              {report.alternatives.map((a) => (
                <span key={a.disease}>
                  {a.disease === 'Other' ? t('review.other') : a.disease} <span className="text-forest-600">{formatConfidence(a.confidence)}</span>
                </span>
              ))}
            </p>
          </Card>

          <Card>
            <CardTitle>{t('review.decision')}</CardTitle>
            {decided ? (
              <DecisionDone report={report} nextPending={nextPending} onReopen={() => updateReport(report.id, { status: 'pending' })} />
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="disease" className="mb-1.5 block text-sm text-forest-700">
                    {t('review.diseaseLabel')}
                  </label>
                  <Select id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} className="bg-cream-50">
                    {options.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label htmlFor="advice" className="mb-1.5 block text-sm text-forest-700">
                    {t('review.adviceLabel')}
                  </label>
                  <textarea
                    id="advice"
                    rows={4}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full rounded-xl border border-brand-200 bg-cream-50 p-3.5 text-[15px] text-forest-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-forest-800">
                  <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="size-5 accent-brand-600" />
                  <Volume2 className="size-4" />
                  {t('review.sendVoice')}
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button variant="secondary" className="h-12 bg-cream-100 ring-0 hover:bg-cream-200" onClick={() => decide('needs_photo')}>
                    <Camera className="size-5" />
                    {t('review.askPhoto')}
                  </Button>
                  <Button className="h-12" onClick={() => decide('verified')}>
                    <Check className="size-5" />
                    {t('review.verify')}
                  </Button>
                </div>
                <button onClick={() => decide('rejected')} className="w-full text-center text-sm font-medium text-red-700 hover:underline">
                  {t('review.reject')}
                </button>
                <p className="text-xs text-forest-600">{t('review.noAutoAlert')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-3xl bg-brand-100 p-5">
        <ShieldCheck className="size-6 shrink-0 text-forest-700" />
        <div>
          <p className="font-semibold text-forest-900">{t('review.footerTitle')}</p>
          <p className="text-xs text-forest-600">{t('review.footerBody')}</p>
        </div>
      </div>

      {nextPending && !decided && (
        <div className="mt-4 text-right">
          <button onClick={() => navigate(`/officer/reports/${nextPending}`)} className="text-sm font-semibold text-brand-700 hover:underline">
            {t('review.skip')} →
          </button>
        </div>
      )}
    </div>
  )
}

function DecisionDone({ report, nextPending, onReopen }: { report: FieldReport; nextPending?: string; onReopen: () => void }) {
  const { t } = useTranslation()
  const Icon = report.status === 'verified' ? CheckCircle2 : report.status === 'rejected' ? XCircle : Camera
  return (
    <div className="space-y-4">
      <div className={cn('flex gap-3 rounded-2xl p-4', report.status === 'verified' ? 'bg-brand-50' : 'bg-cream-100')}>
        <Icon className="size-6 shrink-0 text-brand-600" />
        <div className="text-sm">
          <p className="font-semibold text-forest-900">{t(`review.done.${report.status}`)}</p>
          {report.confirmedDisease && <p className="text-forest-700">{report.confirmedDisease}</p>}
          {report.officerAdvice && <p className="mt-2 text-forest-700">“{report.officerAdvice}”</p>}
        </div>
      </div>
      {report.status === 'verified' && (
        <Link
          to={`/officer/alerts/new?report=${report.id}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
        >
          <Megaphone className="size-5" />
          {t('review.createAlert')}
        </Link>
      )}
      <div className="flex items-center justify-between text-sm">
        <button onClick={onReopen} className="font-medium text-forest-600 hover:underline">
          {t('review.reopen')}
        </button>
        {nextPending && (
          <Link to={`/officer/reports/${nextPending}`} className="font-semibold text-brand-700 hover:underline">
            {t('review.next')} →
          </Link>
        )}
      </div>
    </div>
  )
}

function Timeline({ report }: { report: FieldReport }) {
  const { t } = useTranslation()
  const aiAt = new Date(new Date(report.submittedAt).getTime() + 60_000).toISOString()
  const steps = [
    { done: true, time: formatTime(report.submittedAt), title: t('review.steps.received'), body: t('review.steps.receivedBody') },
    {
      done: true,
      time: formatTime(aiAt),
      title: t('review.steps.ai'),
      body: `${formatConfidence(report.ai.confidence)} · ${report.ai.disease}`,
    },
    report.status === 'pending'
      ? { done: false, time: t('review.steps.now'), title: t('review.steps.waiting'), body: t('review.steps.waitingBody') }
      : {
          done: true,
          time: report.reviewedAt ? formatTime(report.reviewedAt) : '',
          title: t(`review.done.${report.status}`),
          body: report.confirmedDisease ?? '',
        },
  ]
  return (
    <ol className="space-y-5">
      {steps.map((s, i) => (
        <li key={i} className="grid grid-cols-[2rem_3.5rem_1fr] gap-3">
          <span className={cn('grid size-8 place-items-center rounded-full', s.done ? 'bg-brand-100 text-brand-600' : 'bg-harvest-100 text-harvest-700')}>
            {s.done ? <Check className="size-4" /> : <Clock className="size-4" />}
          </span>
          <span className="pt-1 text-sm text-forest-600">{s.time}</span>
          <div>
            <p className="font-semibold text-forest-900">{s.title}</p>
            {s.body && <p className="text-sm text-forest-600">{s.body}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
