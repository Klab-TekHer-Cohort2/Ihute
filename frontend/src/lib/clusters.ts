import { useMemo } from 'react'
import { SECTOR_COORDS } from '@/lib/demo-data'
import type { FieldReport } from '@/types'

export interface SectorCluster {
  sector: string
  count: number
  verified: number
}

/** Groups open reports by sector (demo clustering; the backend will do this properly). */
export function useSectorClusters(reports: FieldReport[]) {
  return useMemo(() => {
    const map = new Map<string, SectorCluster>()
    for (const r of reports) {
      if (r.status === 'rejected' || !SECTOR_COORDS[r.sector]) continue
      const c = map.get(r.sector) ?? { sector: r.sector, count: 0, verified: 0 }
      c.count += 1
      if (r.status === 'verified') c.verified += 1
      map.set(r.sector, c)
    }
    return [...map.values()].sort((a, b) => b.count - a.count)
  }, [reports])
}
