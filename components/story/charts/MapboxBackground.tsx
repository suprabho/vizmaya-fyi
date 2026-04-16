'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapStep, MapPin } from '@/types/story'

export type { MapStep, MapPin }

interface MapboxBackgroundProps {
  accessToken: string
  steps: MapStep[]
  activeStep: number
  style?: string
  defaultPinColor?: string
  defaultPinRadius?: number
  defaultOpacity?: number
  interactive?: boolean
  /** Optional ISO 3166-1 alpha-2 code to highlight as a filled country region. */
  highlightCountry?: string
  /** Color for the highlight fill/outline. Falls back to defaultPinColor. */
  highlightColor?: string
  /**
   * Optional sub-rectangle (fractions of the container, 0..1) where the
   * camera focal point should land in landscape orientation. Implemented
   * via Mapbox's `padding` option, so the YAML `center` of each step still
   * corresponds to a real geographic point — the framework just shifts
   * where on screen that point appears.
   *
   * Example: `{ top: 0.4, left: 0, width: 0.37, height: 0.6 }` puts the
   * focal point in the bottom-left 37%×60% region of the viewport.
   */
  landscapeFocusArea?: {
    top: number
    left: number
    width: number
    height: number
  }
  /**
   * Same as landscapeFocusArea but applied in portrait (mobile) orientation.
   * Shifts the map center upward so pins aren't hidden behind the text card
   * at the bottom of the viewport.
   */
  portraitFocusArea?: {
    top: number
    left: number
    width: number
    height: number
  }
}

const DEFAULT_STYLE = 'mapbox://styles/mapbox/dark-v11'
const DEFAULT_PIN_COLOR = 'var(--color-accent, #D85A30)'
const DEFAULT_PIN_RADIUS = 12
const DEFAULT_OPACITY = 1

function pinKey(pin: MapPin): string {
  return `${pin.coordinates[0]},${pin.coordinates[1]},${pin.label ?? ''}`
}

/**
 * Mapbox paint properties don't accept CSS variables — extract the hex
 * fallback from `var(--name, #hex)` strings, otherwise return as-is.
 */
function resolvePaintColor(color: string, fallback = '#D85A30'): string {
  if (color.startsWith('var(')) {
    const match = color.match(/var\([^,]+,\s*([^)]+)\)/)
    return match?.[1]?.trim() ?? fallback
  }
  return color
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Convert a fractional focus area into Mapbox `padding` (in px). Mapbox
 * treats padding as the area NOT used by the camera — so to put the focal
 * point in the bottom-left 37%×60% box, we pad away the top 40% and the
 * right 63%, leaving an active area whose centroid is the desired spot.
 *
 * Returns all-zeros in portrait (aspect ratio < 1) so the map fills naturally.
 */
function computeFocusPadding(
  container: HTMLDivElement | null,
  landscapeArea?: { top: number; left: number; width: number; height: number },
  portraitArea?: { top: number; left: number; width: number; height: number }
): { top: number; right: number; bottom: number; left: number } {
  const zero = { top: 0, right: 0, bottom: 0, left: 0 }
  if (!container) return zero
  const w = container.clientWidth
  const h = container.clientHeight
  if (w === 0 || h === 0) return zero
  const area = w / h < 1 ? portraitArea : landscapeArea
  if (!area) return zero
  return {
    left: Math.max(0, area.left * w),
    right: Math.max(0, (1 - area.left - area.width) * w),
    top: Math.max(0, area.top * h),
    bottom: Math.max(0, (1 - area.top - area.height) * h),
  }
}

export default function MapboxBackground({
  accessToken,
  steps,
  activeStep,
  style = DEFAULT_STYLE,
  defaultPinColor = DEFAULT_PIN_COLOR,
  defaultPinRadius = DEFAULT_PIN_RADIUS,
  defaultOpacity = DEFAULT_OPACITY,
  interactive = false,
  highlightCountry,
  highlightColor,
  landscapeFocusArea,
  portraitFocusArea,
}: MapboxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [loaded, setLoaded] = useState(false)

  // Initialize map (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!accessToken) return

    mapboxgl.accessToken = accessToken

    const initial = steps[0] ?? {
      center: [0, 20] as [number, number],
      zoom: 2,
      pitch: 0,
      bearing: 0,
    }

    const initialPadding = computeFocusPadding(containerRef.current, landscapeFocusArea, portraitFocusArea)

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center: initial.center,
      zoom: initial.zoom,
      pitch: initial.pitch ?? 0,
      bearing: initial.bearing ?? 0,
      interactive,
      attributionControl: false,
      fadeDuration: 0,
    })

    // Apply focal padding immediately so the first paint already has the
    // camera off-center (Mapbox accepts padding via setPadding after construction).
    if (initialPadding.top || initialPadding.right || initialPadding.bottom || initialPadding.left) {
      map.setPadding(initialPadding)
    }

    map.on('load', () => {
      // Highlight a single country (e.g. South Korea) using Mapbox's
      // country-boundaries-v1 vector tileset. Inserted beneath the first
      // label layer so country/place labels stay readable on top.
      if (highlightCountry) {
        const iso = highlightCountry.toUpperCase()
        const color = resolvePaintColor(highlightColor ?? defaultPinColor)

        if (!map.getSource('country-boundaries')) {
          map.addSource('country-boundaries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1',
          })
        }

        const styleLayers = map.getStyle()?.layers ?? []
        const firstLabelLayer = styleLayers.find(
          (l) => l.type === 'symbol' && (l.layout as { 'text-field'?: unknown } | undefined)?.['text-field'] != null
        )
        const beforeId = firstLabelLayer?.id

        if (!map.getLayer('highlight-country-fill')) {
          map.addLayer(
            {
              id: 'highlight-country-fill',
              type: 'fill',
              source: 'country-boundaries',
              'source-layer': 'country_boundaries',
              filter: ['==', ['get', 'iso_3166_1'], iso],
              paint: {
                'fill-color': color,
                'fill-opacity': 0.22,
              },
            },
            beforeId
          )
        }

        if (!map.getLayer('highlight-country-line')) {
          map.addLayer(
            {
              id: 'highlight-country-line',
              type: 'line',
              source: 'country-boundaries',
              'source-layer': 'country_boundaries',
              filter: ['==', ['get', 'iso_3166_1'], iso],
              paint: {
                'line-color': color,
                'line-width': 1.4,
                'line-opacity': 0.85,
              },
            },
            beforeId
          )
        }
      }

      setLoaded(true)
    })
    mapRef.current = map

    const markers = markersRef.current
    return () => {
      markers.forEach((m) => m.remove())
      markers.clear()
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
  }, [accessToken, style, interactive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate to active step
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return

    const step = steps[activeStep]
    if (!step) return

    const reduceMotion = prefersReducedMotion()
    const padding = computeFocusPadding(containerRef.current, landscapeFocusArea, portraitFocusArea)
    const camera = {
      center: step.center,
      zoom: step.zoom,
      pitch: step.pitch ?? 0,
      bearing: step.bearing ?? 0,
      padding,
    }

    if (reduceMotion) {
      map.jumpTo(camera)
    } else {
      map.flyTo({
        ...camera,
        speed: step.flySpeed ?? 1.2,
        curve: 1.42,
        essential: true,
      })
    }

    // Diff pins: keep shared markers, remove vanished ones, add new ones.
    const desiredPins = step.pins ?? []
    const desiredKeys = new Set(desiredPins.map(pinKey))

    for (const [key, marker] of markersRef.current) {
      if (!desiredKeys.has(key)) {
        marker.remove()
        markersRef.current.delete(key)
      }
    }

    for (const pin of desiredPins) {
      const key = pinKey(pin)
      if (markersRef.current.has(key)) continue

      const color = pin.color ?? defaultPinColor
      const radius = pin.radius ?? defaultPinRadius
      const pulse = pin.pulse !== false

      const el = document.createElement('div')
      el.className = 'mapbox-highlight-marker'
      el.style.cssText = `
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        border-radius: 50%;
        background: ${color};
        opacity: 0.85;
        ${pulse ? `box-shadow: 0 0 0 0 ${color}; animation: mapbox-pulse 2s ease-out infinite;` : ''}
      `

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(pin.coordinates)
        .addTo(map)

      if (pin.label) {
        // labelAnchor describes where the label appears relative to the pin.
        // Mapbox anchor describes where the popup tip points FROM, so invert.
        const anchorMap = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
        const anchor = pin.labelAnchor ? anchorMap[pin.labelAnchor] : undefined

        const popup = new mapboxgl.Popup({
          offset: radius + 8,
          closeButton: false,
          closeOnClick: false,
          className: 'mapbox-highlight-popup',
          ...(anchor ? { anchor } : {}),
        }).setHTML(
          `<div style="
            font-family: var(--font-mono);
            font-size: 0.7rem;
            color: #e0ddd5;
            background: rgba(10, 14, 20, 0.9);
            padding: 4px 10px;
            border-radius: 4px;
            border: 0.5px solid #1a2830;
            white-space: nowrap;
          ">${pin.label}</div>`
        )
        marker.setPopup(popup).togglePopup()
      }

      markersRef.current.set(key, marker)
    }
  }, [activeStep, steps, loaded, defaultPinColor, defaultPinRadius, landscapeFocusArea, portraitFocusArea])

  // Re-evaluate focal padding when the viewport flips between portrait and
  // landscape — without this, rotating the device leaves the camera padded
  // for the previous orientation.
  useEffect(() => {
    if (!loaded) return
    function onResize() {
      const map = mapRef.current
      if (!map) return
      map.setPadding(computeFocusPadding(containerRef.current, landscapeFocusArea, portraitFocusArea))
      // setPadding by itself doesn't redraw at the new focal point — nudge
      // the camera back to the active step so it re-projects with the new pad.
      const step = steps[activeStep]
      if (step) {
        map.jumpTo({
          center: step.center,
          zoom: step.zoom,
          pitch: step.pitch ?? 0,
          bearing: step.bearing ?? 0,
        })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [loaded, landscapeFocusArea, portraitFocusArea, activeStep, steps])

  const currentOpacity = (steps[activeStep]?.opacity ?? defaultOpacity)
  const reduceMotion = typeof window !== 'undefined' && prefersReducedMotion()

  return (
    <>
      <style jsx global>{`
        @keyframes mapbox-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(216, 90, 48, 0.6);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(216, 90, 48, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(216, 90, 48, 0);
          }
        }
        .mapbox-highlight-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapbox-highlight-popup .mapboxgl-popup-tip {
          display: none !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          opacity: loaded ? currentOpacity : 0,
          transition: reduceMotion ? 'none' : 'opacity 800ms ease',
        }}
      />
    </>
  )
}
