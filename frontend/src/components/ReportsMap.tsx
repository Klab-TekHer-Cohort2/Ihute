import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { SECTOR_COORDS } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { SectorCluster } from '@/lib/clusters'

export function ReportsMap({
  clusters,
  className,
  selected,
  onSelect,
}: {
  clusters: SectorCluster[]
  className?: string
  selected?: string
  onSelect?: (sector: string) => void
}) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-brand-100', className)}>
      <MapContainer
        center={[-1.495, 29.625]}
        zoom={11}
        scrollWheelZoom={false}
        className="size-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          className="ihute-tiles"
        />
        {clusters.map((c) => {
          const { lat, lng } = SECTOR_COORDS[c.sector]
          const active = selected === c.sector
          return (
            <CircleMarker
              key={c.sector}
              center={[lat, lng]}
              radius={14 + c.count * 3}
              pathOptions={{
                color: active ? '#163f2d' : '#e0a526',
                weight: active ? 3 : 2,
                fillColor: c.verified > 0 ? '#f2c957' : '#f8e0a0',
                fillOpacity: 0.85,
              }}
              eventHandlers={{ click: () => onSelect?.(c.sector) }}
            >
              <Tooltip direction="center" permanent className="ihute-count">
                <span className="block text-sm font-bold">{c.count}</span>
                <span className="block text-[10px] font-medium">{c.sector}</span>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
