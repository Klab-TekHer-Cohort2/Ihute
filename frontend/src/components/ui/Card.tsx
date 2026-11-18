import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl bg-white p-5 sm:p-6', className)} {...props} />
}

export function CardTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className="text-xl font-semibold text-forest-900">{children}</h2>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  back,
  aside,
}: {
  title: string
  subtitle?: string
  back?: { to: string; label: string }
  aside?: ReactNode
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-900">
          <ChevronLeft className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-900">{title}</h1>
          {subtitle && <p className="mt-1 text-forest-600">{subtitle}</p>}
        </div>
        {aside}
      </div>
    </div>
  )
}

const pillTones = {
  yellow: 'bg-harvest-100 text-harvest-700',
  green: 'bg-brand-100 text-brand-700',
  red: 'bg-red-50 text-red-700',
  clay: 'bg-[#f3e4dc] text-[#8a4b2f]',
  gray: 'bg-cream-200 text-forest-700',
} as const

export type PillTone = keyof typeof pillTones

export function Pill({ tone = 'gray', children, className }: { tone?: PillTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold', pillTones[tone], className)}>
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-brand-200 p-10 text-center">
      <Icon className="size-10 text-brand-400" />
      <p className="mt-3 font-semibold text-forest-900">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-forest-600">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
