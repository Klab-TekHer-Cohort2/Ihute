import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Joins class names; later Tailwind classes override earlier ones (e.g. a page's `pl-14` beats a default `pl-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`
}
