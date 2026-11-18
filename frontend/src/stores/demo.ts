import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { seedAlerts, seedReports, seedUsers } from '@/lib/demo-data'
import type { Alert, DirectoryUser, FieldReport } from '@/types'

/**
 * Demo backend: holds reports, alerts and users in the browser so the
 * farmer → officer → farmer flow works end to end. Swap for API calls later.
 */
interface DemoState {
  reports: FieldReport[]
  alerts: Alert[]
  users: DirectoryUser[]
  addReport: (report: Omit<FieldReport, 'id' | 'status' | 'submittedAt'>) => FieldReport
  updateReport: (id: string, patch: Partial<FieldReport>) => void
  saveAlert: (alert: Omit<Alert, 'id' | 'createdAt'> & { id?: string }) => Alert
  toggleUser: (id: string) => void
  reset: () => void
}

// localStorage can be unavailable (private mode) or full (photos): never crash the app.
const safeStorage: StateStorage = {
  getItem: (k) => {
    try { return localStorage.getItem(k) } catch { return null }
  },
  setItem: (k, v) => {
    try { localStorage.setItem(k, v) } catch { /* ignore quota errors */ }
  },
  removeItem: (k) => {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  },
}

const nextId = (ids: string[]) => {
  const max = Math.max(0, ...ids.map((id) => Number(id.replace(/\D/g, '')) || 0))
  return String(max + 1).padStart(4, '0')
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      reports: seedReports(),
      alerts: seedAlerts(),
      users: seedUsers(),

      addReport: (input) => {
        const report: FieldReport = {
          ...input,
          id: nextId(get().reports.map((r) => r.id)),
          status: 'pending',
          submittedAt: new Date().toISOString(),
        }
        set((s) => ({ reports: [report, ...s.reports] }))
        return report
      },

      updateReport: (id, patch) =>
        set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      saveAlert: ({ id, ...input }) => {
        const existing = id ? get().alerts.find((a) => a.id === id) : undefined
        const alert: Alert = existing
          ? { ...existing, ...input }
          : { ...input, id: `a-${nextId(get().alerts.map((a) => a.id))}`, createdAt: new Date().toISOString() }
        set((s) => ({
          alerts: existing ? s.alerts.map((a) => (a.id === alert.id ? alert : a)) : [alert, ...s.alerts],
        }))
        return alert
      },

      toggleUser: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)) })),

      reset: () => set({ reports: seedReports(), alerts: seedAlerts(), users: seedUsers() }),
    }),
    { name: 'ihute-demo', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
)
