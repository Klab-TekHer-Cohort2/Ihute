import i18n from '@/i18n'

const locale = () => (i18n.language === 'en' ? 'en-GB' : 'rw-RW')

/** Formats with Intl, falling back to en-GB if the runtime lacks Kinyarwanda data. */
function safeFormat(date: Date, options: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(locale(), options).format(date)
  } catch {
    return new Intl.DateTimeFormat('en-GB', options).format(date)
  }
}

// Browsers rarely ship Kinyarwanda date data, so month names are spelled out here.
const RW_MONTHS = [
  'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena',
  'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza',
]

export function formatDate(iso: string) {
  const d = new Date(iso)
  if (i18n.language !== 'en') return `${d.getDate()} ${RW_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return safeFormat(d, { day: 'numeric', month: 'long', year: 'numeric' })
}

export const formatDateTime = (iso: string) =>
  `${formatDate(iso)} · ${safeFormat(new Date(iso), { hour: '2-digit', minute: '2-digit', hour12: false })}`

export const formatTime = (iso: string) => safeFormat(new Date(iso), { hour: '2-digit', minute: '2-digit', hour12: false })

/** "5 min ago" / "2 h ago" / date, translated. */
export function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return i18n.t('time.justNow')
  if (mins < 60) return i18n.t('time.minutes', { count: mins })
  const hours = Math.round(mins / 60)
  if (hours < 24) return i18n.t('time.hours', { count: hours })
  const days = Math.round(hours / 24)
  if (days < 7) return i18n.t('time.days', { count: days })
  return formatDate(iso)
}

export const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString()

export const firstName = (fullName: string) => {
  // Rwandan names are often written "Surname Given"; demo users store "Surname Given".
  const parts = fullName.trim().split(/\s+/)
  return parts[0] ?? fullName
}
