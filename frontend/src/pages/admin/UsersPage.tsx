import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pill } from '@/components/ui/Card'
import { Card, PageHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/stores/demo'
import type { UserRole } from '@/types'

const ROLES: (UserRole | 'all')[] = ['all', 'farmer', 'officer', 'admin']

export function UsersPage() {
  const { t } = useTranslation()
  const users = useDemoStore((s) => s.users)
  const toggleUser = useDemoStore((s) => s.toggleUser)
  const [role, setRole] = useState<(typeof ROLES)[number]>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return users.filter(
      (u) => (role === 'all' || u.role === role) && (!s || [u.fullName, u.phone, u.sector, u.district].some((v) => v.toLowerCase().includes(s))),
    )
  }, [users, role, q])

  return (
    <div>
      <PageHeader title={t('admin.users.title')} subtitle={t('admin.users.subtitle')} />
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition',
                  role === r ? 'bg-forest-900 text-white' : 'bg-cream-100 text-forest-700 hover:bg-cream-200',
                )}
              >
                {r === 'all' ? t('admin.users.all') : t(`roles.${r}`)}
              </button>
            ))}
          </div>
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-forest-600">
                {['name', 'role', 'phone', 'location', 'joined', 'status'].map((h) => (
                  <th key={h} className="border-b border-cream-200 px-3 py-3">
                    {t(`admin.users.cols.${h}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {rows.map((u) => (
                <tr key={u.id} className="text-forest-900">
                  <td className="px-3 py-3 font-semibold">{u.fullName}</td>
                  <td className="px-3 py-3">{t(`roles.${u.role}`)}</td>
                  <td className="px-3 py-3 tabular-nums">{u.phone}</td>
                  <td className="px-3 py-3">
                    {u.sector}, {u.district}
                  </td>
                  <td className="px-3 py-3 text-forest-600">{formatDate(u.joinedAt)}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => toggleUser(u.id)} title={t('admin.users.toggle')} className="rounded-lg">
                      <Pill tone={u.active ? 'green' : 'gray'}>{t(u.active ? 'admin.users.active' : 'admin.users.inactive')}</Pill>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-sm text-forest-600">{t('officer.table.empty')}</p>}
        </div>
      </Card>
    </div>
  )
}
