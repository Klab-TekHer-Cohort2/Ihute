import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()
  return (
    <div role="group" aria-label={t('common.language')} className="inline-flex rounded-xl bg-brand-100 p-1 text-xs font-semibold">
      {(['rw', 'en'] as const).map((lng) => {
        const active = i18n.language === lng
        return (
          <button
            key={lng}
            type="button"
            onClick={() => i18n.changeLanguage(lng)}
            aria-pressed={active}
            lang={lng}
            className={cn(
              'rounded-lg px-3 py-1.5 transition',
              active ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-600 hover:text-forest-900',
            )}
          >
            {compact ? lng.toUpperCase() : lng === 'rw' ? 'Kinyarwanda' : 'English'}
          </button>
        )
      })}
    </div>
  )
}
