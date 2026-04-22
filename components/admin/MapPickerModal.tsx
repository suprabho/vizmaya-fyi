'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { extractMapView, applyMapView, type MapView } from '@/lib/yamlMapPatch'

/**
 * Section-scoped visual map editor. Reads center/zoom/pitch/bearing from the
 * section's raw YAML, opens a full-screen Mapbox canvas, lets the user drag /
 * zoom / pitch / rotate, then splices the new values back into the YAML
 * (preserving comments and all other map keys — pins, regions, heatmap).
 *
 * Intentionally narrower than /map-edit: we don't touch pins, palette, or
 * fontstack here. The broader editor still owns those.
 */

interface Props {
  sectionRaw: string
  sectionLabel: string
  style?: string
  onApply: (nextRaw: string) => void
  onClose: () => void
}

const DEFAULT_STYLE = 'mapbox://styles/mapbox/dark-v11'

export default function MapPickerModal({
  sectionRaw,
  sectionLabel,
  style,
  onApply,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [view, setView] = useState<MapView>(() => extractMapView(sectionRaw) ?? fallbackView())
  const [noMapBlock] = useState(() => extractMapView(sectionRaw) === null)

  useEffect(() => {
    if (!containerRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: style ?? DEFAULT_STYLE,
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      attributionControl: false,
    })
    mapRef.current = map

    const update = () => {
      const c = map.getCenter()
      setView({
        center: [c.lng, c.lat],
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      })
    }
    map.on('moveend', update)
    map.on('zoomend', update)
    map.on('pitchend', update)
    map.on('rotateend', update)

    // The modal flexbox needs a frame to settle its final size. Without this
    // resize, Mapbox locks in the container's initial (too-small) dimensions
    // and the canvas renders as a narrow strip.
    const ro = new ResizeObserver(() => map.resize())
    ro.observe(containerRef.current)
    requestAnimationFrame(() => map.resize())

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  function apply() {
    const next = extractMapView(sectionRaw)
      ? applyMapView(sectionRaw, view)
      : applyMapView(ensureMapBlock(sectionRaw), view)
    onApply(next)
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col">
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10 pt-[max(env(safe-area-inset-top),0.75rem)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Map</div>
          <div className="text-sm truncate">{sectionLabel}</div>
        </div>
        <button
          type="button"
          onClick={apply}
          className="bg-white text-neutral-950 rounded-lg px-4 py-2 text-sm font-medium active:bg-neutral-200"
        >
          Apply
        </button>
      </header>

      <div className="relative flex-1 min-h-0">
        {token ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-neutral-400">
            Missing <code className="bg-white/10 px-1 rounded ml-1 mr-1">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
          </div>
        )}
        {noMapBlock && (
          <div className="absolute top-3 left-3 right-3 text-xs bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-lg px-3 py-2">
            This section has no <code>map:</code> block. Apply will insert one.
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
        <Stat label="lng" value={fmt(view.center[0], 4)} />
        <Stat label="lat" value={fmt(view.center[1], 4)} />
        <Stat label="zoom" value={fmt(view.zoom, 2)} />
        <Stat label="pitch/bear" value={`${fmt(view.pitch, 0)} / ${fmt(view.bearing, 0)}`} />
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-neutral-500 uppercase tracking-wider text-[9px]">{label}</div>
      <div className="text-neutral-200">{value}</div>
    </div>
  )
}

function fmt(n: number, places: number): string {
  const p = Math.pow(10, places)
  return (Math.round(n * p) / p).toString()
}

function fallbackView(): MapView {
  return { center: [0, 20], zoom: 2, pitch: 0, bearing: 0 }
}

/** Insert a minimal `map:` block at the end of the section's YAML so
 *  applyMapView has something to patch. */
function ensureMapBlock(sectionRaw: string): string {
  if (/^\s*map:\s*$/m.test(sectionRaw)) return sectionRaw
  const lines = sectionRaw.split('\n')
  // Match the section item's indent (lines like `    kind:` have 4 spaces).
  const childIndent = lines
    .map((l) => l.match(/^(\s+)\S/)?.[1].length ?? 0)
    .filter((n) => n > 2)
    .sort((a, b) => a - b)[0] ?? 4
  const pad = ' '.repeat(childIndent)
  lines.push(`${pad}map:`)
  return lines.join('\n')
}
