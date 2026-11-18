import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { FieldReport } from '@/types'

/** Farmer's photo, or a drawn leaf placeholder for demo reports that have none. */
export function ReportPhoto({ report, className }: { report: FieldReport; className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-brand-100', className)}>
      {report.imageUrl ? (
        <img src={report.imageUrl} alt={t('review.photoAlt', { crop: t(`crops.${report.crop}`) })} className="size-full object-cover" />
      ) : (
        <LeafPlaceholder seed={Number(report.id) || 1} />
      )}
      {!report.imageUrl && (
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-forest-800">
          {t('review.demoPhoto')}
        </span>
      )}
    </div>
  )
}

function LeafPlaceholder({ seed }: { seed: number }) {
  const spots = Array.from({ length: 9 }, (_, i) => {
    const r = Math.sin(seed * 31 + i * 17) * 10000
    const f = r - Math.floor(r)
    return { x: 120 + ((f * 997) % 1) * 360, y: 90 + ((f * 613) % 1) * 120, w: 18 + ((f * 389) % 1) * 30 }
  })
  return (
    <svg viewBox="0 0 600 300" className="size-full" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <rect width="600" height="300" fill="#466a50" />
      <path d="M-20 260 C120 120 300 60 640 40 L640 120 C380 130 200 200 40 320Z" fill="#6f9a7b" />
      <path d="M-20 260 C120 120 300 60 640 40" stroke="#c6d8c7" strokeWidth="5" fill="none" />
      <path d="M60 330 C200 230 380 200 660 210 L660 300 L60 300Z" fill="#3e7e57" />
      {spots.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.w} ry={s.w / 3.5} transform={`rotate(-14 ${s.x} ${s.y})`} fill="#a0583a" opacity=".75" />
      ))}
    </svg>
  )
}
