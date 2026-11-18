import { ArrowRight, BadgeCheck, Check, IdCard, MapPin, Phone, Sprout, UserRound, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextInput } from '@/components/ui/Field'
import { PROVINCES } from '@/lib/rwanda'
import { cn } from '@/lib/utils'
import {
  formatNationalId,
  isValidNationalId,
  isValidPhoneOrEmail,
  MIN_PASSWORD_LENGTH,
  normalizePhone,
} from '@/lib/validation'
import type { UserRole } from '@/types'
import { PasswordInput } from './PasswordInput'

type Category = 'farmer' | 'officer'

interface FormState {
  category: Category
  firstName: string
  lastName: string
  nationalId: string
  contact: string
  district: string
  sector: string
  password: string
  acceptTerms: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

interface Props {
  onAuthenticated: (
    role: UserRole,
    identity: { fullName: string; phone: string; district?: string; sector?: string },
  ) => void
}

const CATEGORIES: { value: Category; icon: LucideIcon }[] = [
  { value: 'farmer', icon: Sprout },
  { value: 'officer', icon: BadgeCheck },
]

export function RegisterForm({ onAuthenticated }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>({
    category: 'farmer',
    firstName: '',
    lastName: '',
    nationalId: '',
    contact: '',
    district: '',
    sector: '',
    password: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const isOfficer = form.category === 'officer'

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    // clear a field's error as soon as the user edits it
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.firstName.trim()) e.firstName = t('auth.errors.required')
    if (!form.lastName.trim()) e.lastName = t('auth.errors.required')
    if (!isValidNationalId(form.nationalId)) e.nationalId = t('auth.errors.nationalId')
    if (!isValidPhoneOrEmail(form.contact)) e.contact = t('auth.errors.contact')
    if (!form.district) e.district = t('auth.errors.required')
    if (!form.sector.trim()) e.sector = t('auth.errors.required')
    if (form.password.length < MIN_PASSWORD_LENGTH) e.password = t('auth.errors.password', { min: MIN_PASSWORD_LENGTH })
    if (!form.acceptTerms) e.acceptTerms = t('auth.errors.terms')
    return e
  }

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    const firstInvalid = Object.keys(e)[0]
    if (firstInvalid) {
      ev.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    // TODO: replace with backend registration (POST /auth/register) once the API is ready.
    onAuthenticated(form.category, {
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone: normalizePhone(form.contact),
      district: form.district,
      sector: form.sector.trim(),
    })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-forest-900">{t('auth.register.title')}</h2>
        <p className="mt-1 text-forest-600">{t('auth.register.subtitle')}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-forest-800">{t('auth.register.category')}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map(({ value, icon: Icon }) => {
            const checked = form.category === value
            return (
              <label
                key={value}
                className={cn(
                  'relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-200',
                  checked ? 'border-brand-500 bg-brand-50' : 'border-brand-200 bg-white hover:border-brand-300',
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={checked}
                  onChange={() => set('category', value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-xl',
                    checked ? 'bg-brand-600 text-white' : 'bg-brand-100 text-forest-700',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-forest-900">{t(`auth.categories.${value}.title`)}</span>
                  <span className="block text-xs text-forest-600">{t(`auth.categories.${value}.body`)}</span>
                </span>
                {checked && <Check className="absolute right-3 top-3 size-4 text-brand-600" />}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('auth.fields.firstName')} error={errors.firstName}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="firstName"
              aria-describedby={describedBy}
              invalid={invalid}
              icon={UserRound}
              autoComplete="given-name"
              placeholder="Jean Bosco"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
          )}
        </Field>
        <Field label={t('auth.fields.lastName')} error={errors.lastName}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="lastName"
              aria-describedby={describedBy}
              invalid={invalid}
              icon={UserRound}
              autoComplete="family-name"
              placeholder="Mugabo"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
          )}
        </Field>
      </div>

      <Field label={t('auth.fields.nationalId')} error={errors.nationalId} hint={t('auth.hints.nationalId')}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="nationalId"
            aria-describedby={describedBy}
            invalid={invalid}
            icon={IdCard}
            inputMode="numeric"
            autoComplete="off"
            placeholder="1 1990 8 0012345 0 12"
            className="tabular-nums tracking-wide"
            value={form.nationalId}
            onChange={(e) => set('nationalId', formatNationalId(e.target.value))}
          />
        )}
      </Field>

      <Field label={t('auth.fields.contact')} error={errors.contact}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="contact"
            aria-describedby={describedBy}
            invalid={invalid}
            icon={Phone}
            autoComplete="tel"
            placeholder={t('auth.placeholders.contact')}
            value={form.contact}
            onChange={(e) => set('contact', e.target.value)}
          />
        )}
      </Field>

      <fieldset className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200">
        <legend className="sr-only">{t(isOfficer ? 'auth.register.workArea' : 'auth.register.landLocation')}</legend>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-forest-800">
            <MapPin className="size-4 text-brand-600" />
            {t(isOfficer ? 'auth.register.workArea' : 'auth.register.landLocation')}
          </span>
          <span className="rounded-full bg-brand-200 px-2.5 py-0.5 text-[11px] font-semibold text-forest-800">
            MINAGRI Geo
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('auth.fields.district')} error={errors.district}>
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                name="district"
                aria-describedby={describedBy}
                invalid={invalid}
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
                className={cn(!form.district && 'text-forest-600/60')}
              >
                <option value="" disabled>
                  {t('auth.placeholders.district')}
                </option>
                {PROVINCES.map((p) => (
                  <optgroup key={p.key} label={t(`provinces.${p.key}`)}>
                    {p.districts.map((d) => (
                      <option key={d} value={d} className="text-forest-900">
                        {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t('auth.fields.sector')} error={errors.sector}>
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                name="sector"
                aria-describedby={describedBy}
                invalid={invalid}
                placeholder={t('auth.placeholders.sector')}
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <Field label={t('auth.fields.password')} error={errors.password} hint={t('auth.hints.password', { min: MIN_PASSWORD_LENGTH })}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            name="password"
            aria-describedby={describedBy}
            invalid={invalid}
            autoComplete="new-password"
            placeholder={t('auth.placeholders.newPassword')}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
        )}
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-800">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={(e) => set('acceptTerms', e.target.checked)}
            aria-invalid={!!errors.acceptTerms || undefined}
            className="mt-0.5 size-5 shrink-0 rounded accent-brand-600"
          />
          <span>{t('auth.register.terms')}</span>
        </label>
        {errors.acceptTerms && <p className="mt-1.5 pl-8 text-xs text-red-700">{errors.acceptTerms}</p>}
      </div>

      <Button type="submit" className="h-12 w-full text-base">
        {t('auth.register.submit')}
        <ArrowRight className="size-5" />
      </Button>
    </form>
  )
}
