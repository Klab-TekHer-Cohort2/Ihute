import { useTranslation } from 'react-i18next'
import { Pill, type PillTone } from '@/components/ui/Card'
import type { AlertLevel, AlertStatus, ReportStatus } from '@/types'

const REPORT_TONE: Record<ReportStatus, PillTone> = {
  pending: 'yellow',
  needs_photo: 'clay',
  verified: 'green',
  rejected: 'gray',
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { t } = useTranslation()
  return <Pill tone={REPORT_TONE[status]}>{t(`reportStatus.${status}`)}</Pill>
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const { t } = useTranslation()
  return <Pill tone={status === 'sent' ? 'green' : 'yellow'}>{t(`alertStatus.${status}`)}</Pill>
}

const LEVEL_COLOR: Record<AlertLevel, string> = {
  0: 'bg-alert-0',
  1: 'bg-alert-1',
  2: 'bg-alert-2',
  3: 'bg-alert-3',
}

export function AlertLevelBadge({ level }: { level: AlertLevel }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700">
      <span className={`size-2.5 rounded-full ${LEVEL_COLOR[level]}`} />
      {t(`alertLevel.${level}`)}
    </span>
  )
}
