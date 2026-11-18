import { ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ReportStatusBadge } from '@/components/StatusBadge'
import { Select } from '@/components/ui/Field'
import { CROPS } from '@/lib/demo-data'
import { timeAgo } from '@/lib/format'
import { formatConfidence } from '@/lib/utils'
import type { CropKey, FieldReport } from '@/types'

/** Searchable, crop-filterable reports table (design 11, "Raporo zitegereje"). */
export function ReportsTable({ reports, limit }: { reports: FieldReport[]; limit?: number }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [crop, setCrop] = useState<CropKey | ''>('')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return reports.filter(
      (r) =>
        (!crop || r.crop === crop) &&
        (!s || [r.id, r.farmerName, r.sector, r.ai.disease].some((v) => v.toLowerCase().includes(s))),
    )
  }, [reports, crop, q])
  const shown = limit ? filtered.slice(0, limit) : filtered

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={crop} onChange={(e) => setCrop(e.target.value as CropKey | '')} aria-label={t('officer.table.filterCrop')} className="h-11 bg-cream-50 sm:w-52">
          <option value="">{t('officer.table.allCrops')}</option>
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {t(`crops.${c}`)}
            </option>
          ))}
        </Select>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-forest-600" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('officer.table.search')}
            aria-label={t('officer.table.search')}
            className="h-11 w-full rounded-xl border border-brand-200 bg-cream-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-200/60"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-cream-50 p-8 text-center text-sm text-forest-600">{t('officer.table.empty')}</p>
      ) : (
        <>
          {/* Desktop table */}
          <table className="mt-5 hidden w-full border-separate border-spacing-y-1.5 text-sm md:table">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-forest-600">
                {['report', 'farmer', 'crop', 'ai', 'location', 'status'].map((h, i) => (
                  <th key={h} className={`bg-cream-100 px-4 py-3 ${i === 0 ? 'rounded-l-xl' : ''}`}>
                    {t(`officer.table.${h}`)}
                  </th>
                ))}
                <th className="rounded-r-xl bg-cream-100 px-4 py-3">
                  <span className="sr-only">{t('officer.table.open')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/officer/reports/${r.id}`)}
                  className="cursor-pointer text-forest-900 transition hover:[&>td]:bg-brand-50"
                >
                  <td className="rounded-l-xl px-4 py-3.5 font-semibold">#{r.id}</td>
                  <td className="px-4 py-3.5">{r.farmerName}</td>
                  <td className="px-4 py-3.5">{t(`crops.${r.crop}`)}</td>
                  <td className="px-4 py-3.5">
                    {r.ai.disease} · {formatConfidence(r.ai.confidence)}
                  </td>
                  <td className="px-4 py-3.5">{r.sector}</td>
                  <td className="px-4 py-3.5">
                    <ReportStatusBadge status={r.status} />
                  </td>
                  <td className="rounded-r-xl px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/officer/reports/${r.id}`)
                      }}
                      aria-label={t('officer.table.openReport', { id: r.id })}
                      className="rounded-lg p-1 text-forest-700 hover:bg-brand-100"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <ul className="mt-4 divide-y divide-cream-200 md:hidden">
            {shown.map((r) => (
              <li key={r.id}>
                <button onClick={() => navigate(`/officer/reports/${r.id}`)} className="flex w-full items-center gap-3 py-3 text-left">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-forest-900">
                      #{r.id} · {r.farmerName}
                    </p>
                    <p className="truncate text-sm text-forest-600">
                      {t(`crops.${r.crop}`)} · {r.ai.disease} {formatConfidence(r.ai.confidence)} · {r.sector}
                    </p>
                    <p className="text-xs text-forest-600/80">{timeAgo(r.submittedAt)}</p>
                  </div>
                  <ReportStatusBadge status={r.status} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-4 text-xs text-forest-600">
        {t('officer.table.count', { shown: shown.length, total: reports.length })}
      </p>
    </div>
  )
}
