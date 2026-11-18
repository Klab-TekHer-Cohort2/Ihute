import { cn } from '@/lib/utils'

/** IHUTE mark: a leaf with signal bars ("the farmer's voice"), as in the designs. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-8', className)}>
      <path
        d="M4 26C4 14 10.5 5.5 22 4c.6 9.6-4.4 17.6-13.4 19.4L4 26Z"
        fill="currentColor"
      />
      <path d="M5 25c3.5-5 7.6-9.2 12.5-12.6" stroke="var(--color-cream-50)" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <rect x="18" y="22" width="2.6" height="6" rx="1.3" fill="var(--color-harvest-400)" />
      <rect x="22.5" y="18.5" width="2.6" height="9.5" rx="1.3" fill="var(--color-harvest-400)" />
      <rect x="27" y="15" width="2.6" height="13" rx="1.3" fill="var(--color-harvest-400)" />
    </svg>
  )
}

export function Logo({ tone = 'dark', subtitle }: { tone?: 'dark' | 'light'; subtitle?: string }) {
  const light = tone === 'light'
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={light ? 'text-brand-200' : 'text-brand-600'} />
      <div className="leading-tight">
        <div className={cn('text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-forest-900')}>
          IHUTE
        </div>
        {subtitle && (
          <div className={cn('text-[11px] font-medium', light ? 'text-brand-200' : 'text-forest-600')}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
