'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import MapStorySection from './MapStorySection'
import ChartPanel from './ChartPanel'
import type {
  ResolvedUnit,
  StorySectionConfig,
  StoryDefaults,
} from '@/lib/storyConfig.types'
import type MapboxBackgroundType from './charts/MapboxBackground'
import type { MapStep } from './charts/MapboxBackground'

type MapboxBackgroundProps = React.ComponentProps<typeof MapboxBackgroundType>

/**
 * Client-only loader for MapboxBackground.
 *
 * We can't use `next/dynamic({ ssr: false })` here: in Next 16 + Turbopack
 * that throws `BailoutToCSR` during the server render of any client component
 * that references it, and the recovery path inside the affected Suspense
 * boundary can drop sibling DOM at hydration time. Instead, we hold the
 * component in state and import it from a `useEffect` so the module is only
 * ever evaluated in the browser — `mapbox-gl` touches `window` at import
 * time, which would crash a plain server-side import.
 */
function MapboxBackground(props: MapboxBackgroundProps) {
  const [Comp, setComp] = useState<ComponentType<MapboxBackgroundProps> | null>(null)
  useEffect(() => {
    let cancelled = false
    import('./charts/MapboxBackground').then((m) => {
      if (!cancelled) setComp(() => m.default)
    })
    return () => {
      cancelled = true
    }
  }, [])
  if (!Comp) return null
  return <Comp {...props} />
}

interface Props {
  units: ResolvedUnit[]
  sectionConfigs: StorySectionConfig[]
  accessToken: string
  defaults: StoryDefaults
}

/**
 * Page-level orchestrator.
 *
 * Owns:
 *   - The persistent Mapbox background (fixed inset-0, z-0).
 *   - The persistent foreground ChartPanel (fixed, z-10) — keyed by chartId
 *     so it stays mounted across subsections of the same parent, letting
 *     echarts smoothly tween between activeStep values.
 *   - The IntersectionObserver tracking each unit's snap target.
 *   - activeUnit state, derived into:
 *       - activeParent → drives map flyTo
 *       - activeSub    → drives chart activeStep
 *       - currentChart → drives which ChartPanel renders (and its `key`,
 *                        which forces a fresh mount when chartId changes)
 *
 * Critical positioning detail: the scrollable element is the inner snap
 * container (NOT the body). The IntersectionObserver uses
 * `root: containerRef.current` so the fixed map/chart stay stable on iOS
 * Safari and the observer fires reliably as snap settles.
 */
export default function StoryMapShell({
  units,
  sectionConfigs,
  accessToken,
  defaults,
}: Props) {
  const [activeUnit, setActiveUnit] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // One MapStep per top-level section. Multiple units may point to the same
  // entry — flyTo is keyed by parentIndex, not by unit.
  const mapSteps: MapStep[] = sectionConfigs.map((s) => ({
    center: s.map.center,
    zoom: s.map.zoom,
    pitch: s.map.pitch,
    bearing: s.map.bearing,
    flySpeed: s.map.flySpeed ?? defaults.flySpeed,
    opacity: s.map.opacity ?? defaults.mapOpacity,
    pins: s.map.pins?.map((p) => ({
      coordinates: p.coordinates,
      label: p.label,
      color: p.color ?? defaults.pinColor,
      radius: p.radius ?? defaults.pinRadius,
      pulse: p.pulse,
    })),
  }))

  const current = units[activeUnit] ?? units[0]
  const activeParent = current?.parentIndex ?? 0
  const activeSub = current?.subIndex ?? 0
  const currentChartId = current?.parentConfig.chart

  // Single IntersectionObserver across every unit element.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-unit-index]'))
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = Number((visible.target as HTMLElement).dataset.unitIndex)
        if (!Number.isNaN(idx)) setActiveUnit(idx)
      },
      { root, threshold: [0.55] }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [units.length])

  return (
    <>
      {/* ─── Persistent Mapbox background ───────────────────────────────
          Always full-viewport. In landscape, `landscapeFocusArea` tells
          Mapbox to treat the bottom-left 37%×60% region as the camera
          focal box (via map.setPadding internally), so the YAML `center`
          of each section lands inside that visible card. In portrait,
          the focal area is ignored and the map fills naturally. */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MapboxBackground
          accessToken={accessToken}
          steps={mapSteps}
          activeStep={activeParent}
          style={defaults.mapStyle}
          defaultPinColor={defaults.pinColor}
          defaultPinRadius={defaults.pinRadius}
          defaultOpacity={defaults.mapOpacity}
          highlightCountry={defaults.highlightCountry}
          highlightColor={defaults.highlightColor}
          landscapeFocusArea={{ top: 0.4, left: 0, width: 0.37, height: 0.6 }}
        />
      </div>

      {/* ─── Persistent foreground chart panel ──────────────────────────
          Keyed by chartId so the instance persists across subsections of
          the same parent (echarts animations resume from the previous
          activeStep) and re-mounts cleanly when the parent's chart changes.
          Portrait: top-pinned, ~42vh tall, full width.
          Landscape: pinned to the top-right 63% column, top half of viewport
          — text card stacks directly beneath in the bottom half. */}
      {currentChartId && (
        <div
          className="
            fixed pointer-events-none z-10
            top-0 right-0 w-screen h-[42vh]
            [@media(min-aspect-ratio:1/1)]:top-0
            [@media(min-aspect-ratio:1/1)]:w-[63vw]
            [@media(min-aspect-ratio:1/1)]:h-[50vh]
            flex items-center justify-center backdrop-blur-3xl
          "
        >
          <div
            className="w-full h-full max-w-[760px] [@media(min-aspect-ratio:1/1)]:max-w-none rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              background: 'rgba(10, 14, 20, 0.2)',
              border: '0.5px solid var(--color-line, #1a2830)',
            }}
          >
            <ChartPanel
              key={currentChartId}
              chartId={currentChartId}
              activeStep={activeSub}
            />
          </div>
        </div>
      )}

      {/* Snap-scroll container — the scrollable element, root of the observer */}
      <div
        ref={containerRef}
        className="relative z-20 h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {units.map((unit, i) => (
          <MapStorySection
            key={`${unit.parentIndex}-${unit.subIndex}`}
            unitIndex={i}
            unit={unit}
          />
        ))}
      </div>
    </>
  )
}
