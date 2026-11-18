import {
  Bell,
  Camera,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  MapPin,
  MessageCircle,
  Megaphone,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import type { UserRole } from '@/types'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  badge?: 'pendingReports' | 'draftAlerts'
}

const NAV: Record<UserRole, NavItem[]> = {
  farmer: [
    { to: '/farmer', labelKey: 'nav.home', icon: Home },
    { to: '/farmer/report', labelKey: 'nav.report', icon: Camera },
    { to: '/farmer/assistant', labelKey: 'nav.assistant', icon: MessageCircle },
    { to: '/farmer/alerts', labelKey: 'nav.alerts', icon: Bell },
  ],
  officer: [
    { to: '/officer', labelKey: 'nav.overview', icon: LayoutGrid },
    { to: '/officer/reports', labelKey: 'nav.reports', icon: FileText, badge: 'pendingReports' },
    { to: '/officer/alerts', labelKey: 'nav.alerts', icon: Megaphone, badge: 'draftAlerts' },
    { to: '/officer/map', labelKey: 'nav.map', icon: MapPin },
  ],
  admin: [
    { to: '/admin', labelKey: 'nav.overview', icon: LayoutGrid },
    { to: '/admin/users', labelKey: 'nav.users', icon: Users },
  ],
}

function useBadges() {
  const pendingReports = useDemoStore((s) => s.reports.filter((r) => r.status === 'pending').length)
  const draftAlerts = useDemoStore((s) => s.alerts.filter((a) => a.status === 'draft').length)
  return { pendingReports, draftAlerts }
}

function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  return () => {
    logout()
    navigate('/login')
  }
}

export function AppShell({ role }: { role: UserRole }) {
  return role === 'farmer' ? <FarmerShell /> : <DashboardShell role={role} />
}

/* ------------------------------------------------------------------ */
/* Farmer: top navigation on desktop, bottom tabs on mobile (design 10) */
/* ------------------------------------------------------------------ */

function FarmerShell() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const handleLogout = useLogout()
  const items = NAV.farmer

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-cream-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:h-20 sm:px-6">
          <Link to="/farmer" className="flex items-center gap-6">
            <Logo />
            <span className="hidden text-sm text-forest-600 xl:block">{t('app.subtitle')}</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {items.map(({ to, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-2 text-[15px] transition',
                    isActive ? 'font-semibold text-forest-900' : 'text-forest-600 hover:bg-brand-50 hover:text-forest-900',
                  )
                }
              >
                {t(labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-4">
            <LanguageSwitcher compact />
            {user?.sector && (
              <span className="hidden items-center gap-2 rounded-xl bg-cream-100 px-3.5 py-2 text-sm font-medium text-forest-800 lg:inline-flex">
                <MapPin className="size-4" />
                {user.sector}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="grid size-10 place-items-center rounded-xl text-forest-600 hover:bg-brand-50"
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-8">
        <Outlet />
      </main>

      <BottomTabs items={items} className="md:hidden" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Officer / admin: dark sidebar + top bar (designs 11–13)             */
/* ------------------------------------------------------------------ */

function DashboardShell({ role }: { role: Exclude<UserRole, 'farmer'> }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const handleLogout = useLogout()
  const badges = useBadges()
  const items = NAV[role]

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-forest-900 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo tone="light" />
        </div>
        <p className="mt-8 px-2 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70">
          {t(role === 'officer' ? 'shell.officerSection' : 'shell.adminSection')}
        </p>
        <nav className="mt-3 flex flex-col gap-1">
          {items.map(({ to, labelKey, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition',
                  isActive ? 'bg-forest-700 text-white' : 'text-brand-100/85 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="size-5" />
              <span className="flex-1">{t(labelKey)}</span>
              {badge && badges[badge] > 0 && (
                <span className="rounded-lg bg-forest-600 px-2 py-0.5 text-xs font-semibold text-white">{badges[badge]}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="mt-10 px-2 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70">{t('shell.manage')}</p>
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-brand-100/85 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-5" />
          {t('nav.logout')}
        </button>

        {role === 'officer' && (
          <div className="mt-auto rounded-2xl bg-forest-800 p-4">
            <p className="font-semibold text-white">{t('shell.reviewFirst.title')}</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-100/75">{t('shell.reviewFirst.body')}</p>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-cream-200 bg-white/95 px-4 backdrop-blur sm:h-20 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden items-baseline gap-4 lg:flex">
            <span className="text-lg font-semibold text-forest-900">{user?.district ?? 'Musanze'}</span>
            <span className="text-sm text-forest-600">{t(`roles.${role}`)}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-lg bg-harvest-100 px-3 py-1 text-xs font-semibold text-harvest-700 sm:inline">
              {t('common.demo')}
            </span>
            <LanguageSwitcher compact />
            {role === 'officer' && (
              <Link
                to="/officer/reports"
                className="relative grid size-10 place-items-center rounded-xl text-forest-700 hover:bg-brand-50"
                aria-label={t('shell.pendingReports', { count: badges.pendingReports })}
              >
                <Bell className="size-5" />
                {badges.pendingReports > 0 && (
                  <span className="absolute right-2 top-2 size-2.5 rounded-full bg-harvest-500 ring-2 ring-white" />
                )}
              </Link>
            )}
            <div className="hidden items-center gap-3 border-l border-cream-200 pl-4 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-forest-700">
                <UserRound className="size-5" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-forest-900">{user?.fullName}</div>
                <div className="text-xs text-forest-600">{t(`roles.${role}`)}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="grid size-10 place-items-center rounded-xl text-forest-600 hover:bg-brand-50 lg:hidden"
              aria-label={t('nav.logout')}
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:pb-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <BottomTabs items={items} className="lg:hidden" />
      </div>
    </div>
  )
}

function BottomTabs({ items, className }: { items: NavItem[]; className?: string }) {
  const { t } = useTranslation()
  const badges = useBadges()
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-cream-200 bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2',
        className,
      )}
    >
      {items.map(({ to, labelKey, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to.split('/').length === 2}
          className={({ isActive }) =>
            cn(
              'relative flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-forest-600/80',
            )
          }
        >
          <Icon className="size-6" />
          {t(labelKey)}
          {badge && badges[badge] > 0 && (
            <span className="absolute right-2 top-1 size-2 rounded-full bg-harvest-500" />
          )}
        </NavLink>
      ))}
    </nav>
  )
}
