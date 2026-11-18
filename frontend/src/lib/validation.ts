/** Strip everything but digits. */
export const digitsOnly = (value: string) => value.replace(/\D/g, '')

/**
 * Rwandan National ID: 16 digits, displayed in its natural groups
 * 1 YYYY G NNNNNNN F CC (e.g. "1 1990 8 0012345 0 12").
 */
export function formatNationalId(value: string) {
  const d = digitsOnly(value).slice(0, 16)
  const groups = [1, 4, 1, 7, 1, 2]
  const parts: string[] = []
  let i = 0
  for (const size of groups) {
    if (i >= d.length) break
    parts.push(d.slice(i, i + size))
    i += size
  }
  return parts.join(' ')
}

export const isValidNationalId = (value: string) => /^[1-3]\d{15}$/.test(digitsOnly(value))

/** Rwandan mobile: 07X XXX XXXX or +250 7X XXX XXXX (MTN 78/79, Airtel 72/73). */
export function isValidRwPhone(value: string) {
  const compact = value.replace(/[\s-]/g, '')
  return /^(\+?250|0)7[2389]\d{7}$/.test(compact)
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export const isValidPhoneOrEmail = (value: string) => isValidRwPhone(value) || isValidEmail(value)

/** Normalises a Rwandan phone number to +2507XXXXXXXX; returns input unchanged otherwise. */
export function normalizePhone(value: string) {
  const compact = value.replace(/[\s-]/g, '')
  if (!isValidRwPhone(compact)) return value.trim()
  return `+250${compact.slice(-9)}`
}

export const MIN_PASSWORD_LENGTH = 6
