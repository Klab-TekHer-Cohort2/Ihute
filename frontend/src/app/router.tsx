import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RequireRole } from '@/app/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { AuthPage } from '@/pages/auth/AuthPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useAuthStore } from '@/stores/auth'

function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <AuthPage mode="signin" /> },
  { path: '/register', element: <AuthPage mode="register" /> },
  {
    path: '/farmer',
    element: (
      <RequireRole role="farmer">
        <AppShell role="farmer" />
      </RequireRole>
    ),
    children: [
      { index: true, lazy: () => import('@/pages/farmer/FarmerHome').then((m) => ({ Component: m.FarmerHome })) },
      { path: 'report', lazy: () => import('@/pages/farmer/ReportPage').then((m) => ({ Component: m.ReportPage })) },
      { path: 'assistant', lazy: () => import('@/pages/farmer/AssistantPage').then((m) => ({ Component: m.AssistantPage })) },
      { path: 'alerts', lazy: () => import('@/pages/farmer/FarmerAlerts').then((m) => ({ Component: m.FarmerAlerts })) },
    ],
  },
  {
    path: '/officer',
    element: (
      <RequireRole role="officer">
        <AppShell role="officer" />
      </RequireRole>
    ),
    children: [
      { index: true, lazy: () => import('@/pages/officer/OfficerOverview').then((m) => ({ Component: m.OfficerOverview })) },
      { path: 'reports', lazy: () => import('@/pages/officer/ReportsPage').then((m) => ({ Component: m.ReportsPage })) },
      { path: 'reports/:id', lazy: () => import('@/pages/officer/ReportReview').then((m) => ({ Component: m.ReportReview })) },
      { path: 'alerts', lazy: () => import('@/pages/officer/AlertsPage').then((m) => ({ Component: m.AlertsPage })) },
      { path: 'alerts/new', lazy: () => import('@/pages/officer/AlertComposer').then((m) => ({ Component: m.AlertComposer })) },
      { path: 'alerts/:id', lazy: () => import('@/pages/officer/AlertComposer').then((m) => ({ Component: m.AlertComposer })) },
      { path: 'map', lazy: () => import('@/pages/officer/MapPage').then((m) => ({ Component: m.MapPage })) },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireRole role="admin">
        <AppShell role="admin" />
      </RequireRole>
    ),
    children: [
      { index: true, lazy: () => import('@/pages/admin/AdminOverview').then((m) => ({ Component: m.AdminOverview })) },
      { path: 'users', lazy: () => import('@/pages/admin/UsersPage').then((m) => ({ Component: m.UsersPage })) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
