import { Check, FileQuestion, MapPin, Save, Send, ShieldCheck, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CropIcon } from '@/components/CropIcon'
import { AlertStatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, PageHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { CROPS, DEMO_DISTRICT, SECTORS, estimateReach } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'
import type { Alert, AlertLevel, CropKey } from '@/types'

const RADII = [1, 3, 5, 10]
const SMS_LEN = 160
const MAX_LEN = SMS_LEN * 2

export function AlertComposer() {
  const { id } = useParams()
  return <ComposerInner key={id ?? 'new'} id={id} />
}

function ComposerInner({ id }: { id?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reports = useDemoStore((s) => s.reports)
  const existing = useDemoStore((s) => (id ? s.alerts.find((a) => a.id === id) : undefined))
  const saveAlert = useDemoStore((s) => s.saveAlert)

  // Prefill from a verified report when coming from the review screen.
  const fromReport = reports.find((r) => r.id === params.get('report'))
  const [crop, setCrop] = useState<CropKey>(existing?.crop ?? fromReport?.crop ?? 'maize')
  const [sector, setSector] = useState(existing?.sector ?? fromReport?.sector ?? SECTORS[0])
  const [radiusKm, setRadius] = useState(existing?.radiusKm ?? 5)
  const [level, setLevel] = useState<AlertLevel>(existing?.level ?? 2)
  const [title, setTitle] = useState(
    existing?.title ?? (fromReport ? `${fromReport.confirmedDisease ?? fromReport.ai.disease} · ${t(`crops.${fromReport.crop}`)}` : ''),
  )
  const [message, setMessage] = useState(existing?.message ?? t('alertForm.defaultMessage'))
  const [linked, setLinked] = useState<string[]>(existing?.reportIds ?? (fromReport ? [fromReport.id] : []))
  const [checks, setChecks] = useState([false, false])
  const [tried, setTried] = useState(false)

  if (id && !existing) {
    return <EmptyState icon={FileQuestion} title={t('alertForm.notFound')} action={<Link to="/officer/alerts" className="font-semibold text-brand-700 underline">{t('alertForm.back')}</Link>} />
  }
  const readOnly = existing?.status === 'sent'

  const verified = reports.filter((r) => r.status === 'verified' && r.crop === crop)
  const reach = estimateReach(radiusKm)
  const sms = Math.max(1, Math.ceil(message.length / SMS_LEN))
  const errors = {
    title: !title.trim() ? t('auth.errors.required') : undefined,
    message: !message.trim() ? t('auth.errors.required') : message.length > MAX_LEN ? t('alertForm.tooLong', { max: MAX_LEN }) : undefined,
    reports: linked.length === 0 ? t('alertForm.needReport') : undefined,
  }
  const valid = !errors.title && !errors.message && !errors.reports
  const canSend = valid && checks.every(Boolean)

  const build = (status: Alert['status']) => ({
    id,
    crop,
    sector,
    district: DEMO_DISTRICT,
    radiusKm,
    level,
    title: title.trim(),
    message: message.trim(),
    reportIds: linked,
    farmersReached: reach,
    status,
    sentAt: status === 'sent' ? new Date().toISOString() : undefined,
  })

  const saveDraft = () => {
    setTried(true)
    if (!title.trim()) return
    saveAlert(build('draft'))
    navigate('/officer/alerts', { state: { flash: 'draft' } })
  }
  const send = () => {
    setTried(true)
    if (!canSend) return
    saveAlert(build('sent'))
    navigate('/officer/alerts', { state: { flash: 'sent', reach } })
  }

  const toggleLinked = (rid: string) => setLinked((l) => (l.includes(rid) ? l.filter((x) => x !== rid) : [...l, rid]))

  return (
    <div>
      <PageHeader
        back={{ to: '/officer/alerts', label: t('alertForm.back') }}
        title={t('alertForm.title')}
        aside={<AlertStatusBadge status={existing?.status ?? 'draft'} />}
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-6">
          <fieldset disabled={readOnly} className="space-y-6">
            {/* 01 */}
            <section>
              <h2 className="text-xl font-semibold text-forest-900">
                <span className="mr-3">01</span>
                {t('alertForm.s1')}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <CropIcon crop={crop} className="size-8" />
                  </span>
                  <Select
                    aria-label={t('alertForm.crop')}
                    value={crop}
                    onChange={(e) => {
                      setCrop(e.target.value as CropKey)
                      setLinked([])
                    }}
                    className="h-14 bg-cream-100 pl-14 font-semibold"
                  >
                    {CROPS.map((c) => (
                      <option key={c} value={c}>
                        {t(`crops.${c}`)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-forest-700" />
                    <Select aria-label={t('alertForm.sector')} value={sector} onChange={(e) => setSector(e.target.value)} className="h-14 bg-cream-100 pl-11">
                      {SECTORS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </div>
                  <Select aria-label={t('alertForm.radius')} value={radiusKm} onChange={(e) => setRadius(Number(e.target.value))} className="h-14 w-28 bg-cream-100">
                    {RADII.map((r) => (
                      <option key={r} value={r}>
                        {r} km
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-forest-600">{t('alertForm.reach', { count: reach })}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-forest-600">{t('alertForm.level')}</span>
                  {([1, 2, 3] as AlertLevel[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      aria-pressed={level === l}
                      className={cn(
                        'rounded-lg px-3 py-1 font-semibold transition',
                        level === l ? 'bg-forest-900 text-white' : 'bg-cream-100 text-forest-700 hover:bg-cream-200',
                      )}
                      title={t(`alertLevel.${l}`)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <hr className="border-cream-200" />

            {/* 02 */}
            <section>
              <h2 className="text-xl font-semibold text-forest-900">
                <span className="mr-3">02</span>
                {t('alertForm.s2')}
              </h2>
              <label htmlFor="al-title" className="mt-4 block text-sm text-forest-700">
                {t('alertForm.titleLabel')}
              </label>
              <input
                id="al-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={(tried && !!errors.title) || undefined}
                className={cn(
                  'mt-1.5 h-12 w-full rounded-xl border bg-cream-100 px-4 text-[15px] text-forest-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60',
                  tried && errors.title ? 'border-red-400' : 'border-transparent',
                )}
              />
              {tried && errors.title && <p className="mt-1 text-xs text-red-700">{errors.title}</p>}

              <div className="mt-4 flex items-baseline justify-between">
                <label htmlFor="al-msg" className="text-sm text-forest-700">
                  {t('alertForm.messageLabel')}
                </label>
                <span className={cn('text-xs tabular-nums', message.length > MAX_LEN ? 'text-red-700' : 'text-forest-600')}>
                  {message.length}/{MAX_LEN} · {t('alertForm.sms', { count: sms })}
                </span>
              </div>
              <textarea
                id="al-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={(tried && !!errors.message) || undefined}
                className={cn(
                  'mt-1.5 w-full rounded-xl border bg-cream-100 p-4 text-[15px] leading-relaxed text-forest-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60',
                  tried && errors.message ? 'border-red-400' : 'border-transparent',
                )}
              />
              {tried && errors.message && <p className="mt-1 text-xs text-red-700">{errors.message}</p>}

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-brand-100 p-4">
                <Volume2 className="size-6 shrink-0 text-forest-700" />
                <div>
                  <p className="font-semibold text-forest-900">{t('alertForm.voiceTitle')}</p>
                  <p className="text-xs text-forest-600">{t('alertForm.voiceBody')}</p>
                </div>
              </div>
            </section>

            {/* 03 */}
            <section>
              <h2 className="text-xl font-semibold text-forest-900">
                <span className="mr-3">03</span>
                {t('alertForm.s3')}
              </h2>
              {verified.length === 0 ? (
                <p className="mt-3 text-sm text-forest-600">{t('alertForm.noVerified')}</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {verified.map((r) => {
                    const on = linked.includes(r.id)
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleLinked(r.id)}
                        aria-pressed={on}
                        title={`${r.farmerName} · ${r.sector}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                          on ? 'bg-brand-600 text-white' : 'bg-brand-50 text-forest-700 ring-1 ring-brand-200 hover:ring-brand-400',
                        )}
                      >
                        #{r.id} · {r.sector}
                        {on && <Check className="size-3.5" />}
                      </button>
                    )
                  })}
                </div>
              )}
              {tried && errors.reports && <p className="mt-2 text-xs text-red-700">{errors.reports}</p>}
            </section>
          </fieldset>
        </Card>

        <div className="space-y-5">
          <div className="rounded-3xl bg-brand-100 p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-forest-900">{t('alertForm.preview')}</h2>
            <p className="mt-1 text-xs text-forest-600">
              {sector} · {t('alertForm.previewHint')}
            </p>
            <div className="mt-4 rounded-2xl bg-harvest-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-harvest-700">
                  {t(readOnly ? 'alertStatus.sent' : 'alertForm.awaiting')}
                </span>
                <CropIcon crop={crop} className="size-12" />
              </div>
              <p className="mt-3 break-words text-2xl font-bold text-harvest-700">{title || '—'}</p>
              <p className="mt-1 text-sm text-harvest-700">
                {sector} · {t('alertForm.within', { km: radiusKm })}
              </p>
              <p className="mt-4 whitespace-pre-line break-words text-[17px] leading-relaxed text-forest-900">{message}</p>
              <div className="mt-5 flex h-12 items-center gap-3 rounded-xl bg-brand-600 px-5 font-semibold text-white">
                <Volume2 className="size-5" />
                {t('farmer.home.openAlert')}
              </div>
            </div>
          </div>

          {!readOnly && (
            <Card>
              <h2 className="text-xl font-semibold text-forest-900">{t('alertForm.confirmFirst')}</h2>
              <div className="mt-4 space-y-3">
                {[0, 1].map((i) => (
                  <label key={i} className="flex cursor-pointer items-center gap-3 text-[15px] text-forest-900">
                    <input
                      type="checkbox"
                      checked={checks[i]}
                      onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                      className="size-5 accent-brand-600"
                    />
                    {t(`alertForm.check${i + 1}`)}
                  </label>
                ))}
              </div>
              <Button onClick={send} disabled={!canSend} className="mt-6 h-14 w-full text-base">
                <Send className="size-5" />
                {t('alertForm.send')}
              </Button>
              {!canSend && <p className="mt-2 text-xs text-forest-600">{t(valid ? 'alertForm.tickBoth' : 'alertForm.completeForm')}</p>}
              <Button variant="ghost" onClick={saveDraft} className="mt-2 h-11 w-full">
                <Save className="size-4" />
                {t('alertForm.saveDraft')}
              </Button>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-3xl bg-brand-100 p-5">
        <ShieldCheck className="size-6 shrink-0 text-forest-700" />
        <div>
          <p className="font-semibold text-forest-900">{t('alertForm.footerTitle')}</p>
          <p className="text-xs text-forest-600">{t('alertForm.footerBody')}</p>
        </div>
      </div>
    </div>
  )
}
