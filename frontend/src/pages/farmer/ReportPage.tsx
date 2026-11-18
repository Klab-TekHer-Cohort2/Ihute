import { Camera, CheckCircle2, ImagePlus, Loader2, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { CropIcon } from '@/components/CropIcon'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { CROPS, DEMO_DISTRICT, mockDiagnose } from '@/lib/demo-data'
import { resizeImage } from '@/lib/image'
import { cn, formatConfidence } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import type { CropKey, FieldReport } from '@/types'

const isCrop = (v: string | null): v is CropKey => !!v && (CROPS as string[]).includes(v)

export function ReportPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const addReport = useDemoStore((s) => s.addReport)
  const fileRef = useRef<HTMLInputElement>(null)

  const initialCrop = params.get('crop')
  const [crop, setCrop] = useState<CropKey | null>(isCrop(initialCrop) ? initialCrop : null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<FieldReport | null>(null)

  const pickPhoto = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError(t('farmer.report.errors.notImage'))
    setError(null)
    try {
      setPhoto(await resizeImage(file))
    } catch {
      setError(t('farmer.report.errors.notImage'))
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!crop) return setError(t('farmer.report.errors.crop'))
    if (!photo && !description.trim()) return setError(t('farmer.report.errors.photo'))
    setError(null)
    setBusy(true)
    // TODO: POST /reports (multipart) → backend runs the model. Simulated here.
    await new Promise((r) => setTimeout(r, 1200))
    const report = addReport({
      farmerName: user?.fullName ?? 'Umuhinzi',
      crop,
      sector: user?.sector ?? 'Muhoza',
      district: user?.district ?? DEMO_DISTRICT,
      imageUrl: photo ?? undefined,
      description: description.trim() || undefined,
      ...mockDiagnose(crop),
    })
    setBusy(false)
    setResult(report)
  }

  const restart = () => {
    setResult(null)
    setPhoto(null)
    setDescription('')
  }

  if (result) return <ReportResult report={result} onAgain={restart} />

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl" noValidate>
      <PageHeader title={t('farmer.report.title')} subtitle={t('farmer.report.subtitle')} />

      <Card>
        <h2 className="font-semibold text-forest-900">
          <span className="mr-2 text-brand-600">1</span>
          {t('farmer.report.chooseCrop')}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label={t('farmer.report.chooseCrop')}>
          {CROPS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={crop === c}
              onClick={() => setCrop(c)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border p-4 transition',
                crop === c ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-cream-200 hover:border-brand-300',
              )}
            >
              <CropIcon crop={c} className="size-12" />
              <span className="font-semibold text-forest-900">{t(`crops.${c}`)}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold text-forest-900">
          <span className="mr-2 text-brand-600">2</span>
          {t('farmer.report.takePhoto')}
        </h2>
        <p className="mt-1 text-sm text-forest-600">{t('farmer.report.photoTip')}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => pickPhoto(e.target.files?.[0])}
          aria-label={t('farmer.report.takePhoto')}
        />

        {photo ? (
          <div className="relative mt-4 overflow-hidden rounded-2xl">
            <img src={photo} alt={t('farmer.report.preview')} className="max-h-80 w-full object-cover" />
            <div className="absolute right-3 top-3 flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="grid size-10 place-items-center rounded-xl bg-white/90 text-forest-800" aria-label={t('farmer.report.retake')}>
                <RotateCcw className="size-5" />
              </button>
              <button type="button" onClick={() => setPhoto(null)} className="grid size-10 place-items-center rounded-xl bg-white/90 text-red-700" aria-label={t('farmer.report.remove')}>
                <Trash2 className="size-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              pickPhoto(e.dataTransfer.files?.[0])
            }}
            className="mt-4 flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-6 py-10 text-center transition hover:bg-brand-100"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-white">
              <Camera className="size-7" />
            </span>
            <span className="font-semibold text-forest-900">{t('farmer.report.tapToTake')}</span>
            <span className="flex items-center gap-1.5 text-sm text-forest-600">
              <ImagePlus className="size-4" />
              {t('farmer.report.orUpload')}
            </span>
          </button>
        )}
      </Card>

      <Card className="mt-4">
        <label htmlFor="desc" className="font-semibold text-forest-900">
          <span className="mr-2 text-brand-600">3</span>
          {t('farmer.report.describe')} <span className="font-normal text-forest-600">({t('common.optional')})</span>
        </label>
        <textarea
          id="desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('farmer.report.describePlaceholder')}
          className="mt-3 w-full rounded-xl border border-brand-200 bg-white p-4 text-[15px] outline-none placeholder:text-forest-600/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60"
        />
      </Card>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy} className="mt-6 h-14 w-full text-base">
        {busy ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
        {t(busy ? 'farmer.report.analyzing' : 'farmer.report.submit')}
      </Button>
    </form>
  )
}

function ReportResult({ report, onAgain }: { report: FieldReport; onAgain: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3 rounded-3xl bg-brand-100 p-5">
        <CheckCircle2 className="size-8 shrink-0 text-brand-600" />
        <div>
          <p className="font-semibold text-forest-900">{t('farmer.report.sentTitle', { id: report.id })}</p>
          <p className="text-sm text-forest-700">{t('farmer.report.sentBody')}</p>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest-600">{t('farmer.report.aiThinks')}</p>
        <p className="mt-1 text-2xl font-bold text-forest-900">{report.ai.disease}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-harvest-400" style={{ width: formatConfidence(report.ai.confidence) }} />
          </div>
          <span className="text-sm font-semibold text-forest-800">{formatConfidence(report.ai.confidence)}</span>
        </div>
        <p className="mt-2 text-xs text-forest-600">{t('farmer.report.notConfirmed')}</p>

        <h3 className="mt-6 font-semibold text-forest-900">{t('farmer.report.whatNow')}</h3>
        <ul className="mt-2 space-y-2 text-sm text-forest-800">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
              {t(`farmer.report.advice.${n}`)}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onAgain} className="h-12 flex-1">
          {t('farmer.report.another')}
        </Button>
        <Link to="/farmer" className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700">
          {t('common.backHome')}
        </Link>
      </div>
    </div>
  )
}
