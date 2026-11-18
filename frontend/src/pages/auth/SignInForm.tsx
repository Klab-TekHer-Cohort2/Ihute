import { ArrowRight, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { DEMO_USERS } from '@/lib/demo-data'
import { isValidNationalId, isValidPhoneOrEmail, MIN_PASSWORD_LENGTH, normalizePhone } from '@/lib/validation'
import type { UserRole } from '@/types'
import { PasswordInput } from './PasswordInput'

interface Props {
  onAuthenticated: (
    role: UserRole,
    identity: { fullName: string; phone: string; district?: string; sector?: string },
  ) => void
}

export function SignInForm({ onAuthenticated }: Props) {
  const { t } = useTranslation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!isValidPhoneOrEmail(identifier) && !isValidNationalId(identifier)) next.identifier = t('auth.errors.identifier')
    if (password.length < MIN_PASSWORD_LENGTH) next.password = t('auth.errors.password', { min: MIN_PASSWORD_LENGTH })
    setErrors(next)
    if (Object.keys(next).length) return

    // TODO: replace with backend auth (POST /auth/login) once the API is ready.
    const { fullName, district, sector } = DEMO_USERS.farmer
    onAuthenticated('farmer', { fullName, district, sector, phone: normalizePhone(identifier) })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-forest-900">{t('auth.signIn.title')}</h2>
        <p className="mt-1 text-forest-600">{t('auth.signIn.subtitle')}</p>
      </div>

      <Field label={t('auth.fields.identifier')} error={errors.identifier}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            icon={UserRound}
            autoComplete="username"
            placeholder={t('auth.placeholders.identifier')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        )}
      </Field>

      <Field label={t('auth.fields.password')} error={errors.password}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            autoComplete="current-password"
            placeholder={t('auth.placeholders.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </Field>

      <div className="flex justify-end">
        <button type="button" className="text-sm font-semibold text-brand-600 hover:underline">
          {t('auth.signIn.forgot')}
        </button>
      </div>

      <Button type="submit" className="h-12 w-full text-base">
        {t('auth.signIn.submit')}
        <ArrowRight className="size-5" />
      </Button>

      <DemoAccess
        onPick={(role) => {
          const { fullName, phone, district, sector } = DEMO_USERS[role]
          onAuthenticated(role, { fullName, phone, district, sector })
        }}
      />
    </form>
  )
}

/** Quick entry for each role while the backend is not connected. */
function DemoAccess({ onPick }: { onPick: (role: UserRole) => void }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border border-dashed border-harvest-400/70 bg-harvest-100/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-harvest-700">{t('auth.continueAs')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['farmer', 'officer', 'admin'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onPick(role)}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-forest-800 ring-1 ring-harvest-200 transition hover:ring-harvest-500"
          >
            {t(`roles.${role}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
