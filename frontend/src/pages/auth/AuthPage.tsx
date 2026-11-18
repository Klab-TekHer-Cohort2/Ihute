import { RadioTower } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { USSD_CODE } from '@/lib/rwanda'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'
import { AuthHero } from './AuthHero'
import { RegisterForm } from './RegisterForm'
import { SignInForm } from './SignInForm'

type Mode = 'signin' | 'register'

const YEAR = new Date().getFullYear()

/** Public landing page: brand panel + sign in / register (routes /login and /register). */
export function AuthPage({ mode }: { mode: Mode }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)

  if (user) return <Navigate to={`/${user.role}`} replace />

  const handleAuthenticated = (
    role: UserRole,
    identity: { fullName: string; phone: string; district?: string; sector?: string },
  ) => {
    login(
      { id: 'demo', role, preferredLanguage: i18n.language === 'en' ? 'en' : 'rw', ...identity },
      'demo-token',
    )
    navigate(`/${role}`)
  }

  return (
    <div className="min-h-full bg-cream-100 lg:p-6">
      <div className="mx-auto grid min-h-full max-w-7xl overflow-hidden bg-white shadow-sm lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2 lg:rounded-3xl lg:ring-1 lg:ring-cream-200">
        <AuthHero />

        <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="mx-auto mt-6 w-full max-w-lg flex-1">
            <div role="tablist" aria-label={t('auth.tabsLabel')} className="grid grid-cols-2 gap-1 rounded-2xl bg-brand-100 p-1.5">
              {(['signin', 'register'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => navigate(m === 'signin' ? '/login' : '/register', { replace: true })}
                  className={cn(
                    'h-12 rounded-xl text-[15px] font-semibold transition',
                    mode === m ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-600 hover:text-forest-900',
                  )}
                >
                  {t(m === 'signin' ? 'auth.tabs.signIn' : 'auth.tabs.register')}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="mt-8">
              {mode === 'signin' ? (
                <SignInForm onAuthenticated={handleAuthenticated} />
              ) : (
                <RegisterForm onAuthenticated={handleAuthenticated} />
              )}
            </div>

            <aside className="mt-8 flex gap-4 rounded-2xl bg-harvest-100 p-4 ring-1 ring-harvest-200">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-harvest-400 text-forest-900">
                <RadioTower className="size-5" />
              </span>
              <div className="text-sm">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-forest-900">
                  {t('auth.offline.title')}
                  <span className="rounded-full bg-forest-900 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    SMS / USSD
                  </span>
                </p>
                <p className="mt-1 text-harvest-700">
                  {t('auth.offline.dialPrefix')}{' '}
                  <a href={`tel:${encodeURIComponent(USSD_CODE)}`} className="font-bold text-forest-900 underline decoration-harvest-500 underline-offset-2">
                    {USSD_CODE}
                  </a>{' '}
                  {t('auth.offline.dialSuffix')}
                </p>
              </div>
            </aside>
          </div>

          <footer className="mx-auto mt-10 flex w-full max-w-lg flex-wrap items-center justify-between gap-3 text-xs text-forest-600">
            <span>© {YEAR} IHUTE · MINAGRI</span>
            <nav className="flex gap-4">
              <a href="#" className="hover:text-forest-900">{t('auth.footer.terms')}</a>
              <a href="#" className="hover:text-forest-900">{t('auth.footer.privacy')}</a>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  )
}
