import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <p className="text-forest-600">{t('common.notFound')}</p>
      <Link to="/" className="text-sm font-semibold text-brand-700 underline">
        {t('common.goHome')}
      </Link>
    </div>
  )
}
