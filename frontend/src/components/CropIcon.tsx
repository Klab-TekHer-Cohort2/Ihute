import type { CropKey } from '@/types'
import { cn } from '@/lib/utils'

/** Small flat illustrations of the four main crops, in the IHUTE palette. */
export function CropIcon({ crop, className }: { crop: CropKey; className?: string }) {
  const cls = cn('size-14 shrink-0', className)
  switch (crop) {
    case 'maize':
      return (
        <svg viewBox="0 0 64 64" className={cls} aria-hidden="true">
          <path d="M32 60C20 50 12 40 10 26c8 4 14 12 18 24" fill="#2b7048" />
          <path d="M32 60c12-10 20-20 22-34-8 4-14 12-18 24" fill="#3e7e57" />
          <rect x="22" y="6" width="20" height="44" rx="10" fill="#f2c957" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}-${c}`} cx={26.5 + c * 5.5} cy={13 + r * 6} r="2.1" fill="#e0a526" />
            )),
          )}
          <path d="M32 60c-6-8-8-18-6-30 3 8 5 18 6 30Z" fill="#6f9a7b" />
          <path d="M32 60c6-8 8-18 6-30-3 8-5 18-6 30Z" fill="#6f9a7b" />
        </svg>
      )
    case 'beans':
      return (
        <svg viewBox="0 0 64 64" className={cls} aria-hidden="true">
          <path d="M40 8c10 6 14 22 6 40-3 7-10 10-13 6 8-14 10-30 7-46Z" fill="#6f9a7b" />
          <path d="M40 8c6 8 7 24 1 40" stroke="#2b7048" strokeWidth="2" fill="none" />
          {[18, 28, 38].map((y) => (
            <ellipse key={y} cx={43 - (y - 18) / 8} cy={y} rx="3" ry="4" fill="#c6d8c7" />
          ))}
          <ellipse cx="16" cy="22" rx="6" ry="8" transform="rotate(-25 16 22)" fill="#8a4b2f" />
          <ellipse cx="20" cy="40" rx="6" ry="8" transform="rotate(20 20 40)" fill="#a0583a" />
          <ellipse cx="14" cy="52" rx="5" ry="6.5" transform="rotate(-10 14 52)" fill="#8a4b2f" />
          <circle cx="15" cy="21" r="1.5" fill="#f6f5ee" />
          <circle cx="21" cy="39" r="1.5" fill="#f6f5ee" />
        </svg>
      )
    case 'cassava':
      return (
        <svg viewBox="0 0 64 64" className={cls} aria-hidden="true">
          {[-60, -30, 0, 30, 60].map((a) => (
            <ellipse key={a} cx="32" cy="12" rx="3.5" ry="11" transform={`rotate(${a} 32 22)`} fill="#2b7048" />
          ))}
          <path d="M30 26c-8 6-14 18-14 30 0 4 4 5 6 2 6-8 10-20 10-30Z" fill="#a0583a" />
          <path d="M34 26c6 8 10 18 8 28-1 4-5 4-6 1-3-9-4-19-2-29Z" fill="#8a4b2f" />
          <path d="M22 44l4 2M24 36l4 2M38 38l-3 2M39 46l-3 1" stroke="#f3e4dc" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'potato':
      return (
        <svg viewBox="0 0 64 64" className={cls} aria-hidden="true">
          <ellipse cx="26" cy="36" rx="18" ry="14" fill="#c49a62" />
          <ellipse cx="42" cy="44" rx="16" ry="11" fill="#d8b47c" />
          <ellipse cx="42" cy="44" rx="11" ry="6" fill="#f3e6c4" />
          {[
            [18, 30],
            [30, 28],
            [22, 42],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#8d6e4f" />
          ))}
          <path d="M28 22c0-6 4-10 10-12-1 6-4 10-10 12Z" fill="#3e7e57" />
        </svg>
      )
  }
}
