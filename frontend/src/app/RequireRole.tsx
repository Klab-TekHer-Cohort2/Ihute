import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

/** Role-based route guard (doc 9.4: role-based access control). */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <>{children}</>
}
