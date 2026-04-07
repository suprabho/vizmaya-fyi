'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapStep {
  center: [number, number] // [lng, lat]
  zoom: number
  pitch?: number
  bearing?: number
  speed?: number // flyTo speed (default 0.8)
  highlight?: {
    coordinates: [number, number]
    label?: string
    color?: string
    radius?: number // circle radius in px
  }
}

interface MapboxBackgroundProps {
  steps: MapStep[]
  activeStep: number
  style?: string // map style URL
  interactive?: boolean
}

const DEFAULT_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export default function MapboxBackground({
  steps,
  activeStep,
  style = DEFAULT_STYLE,
  interactive = false,
}: MapboxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [loaded, setLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initial = steps[0] ?? {
      center: [0, 20] as [number, number],
      zoom: 2,
      pitch: 0,
      bearing: 0,
    }

    const map = new maplibregl.Map({
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

    map.on('load', () => {
      setLoaded(true)
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
  }, [style, interactive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate to active step
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return

    const step = steps[activeStep]
    if (!step) return

    map.flyTo({
      center: step.center,
      zoom: step.zoom,
      pitch: step.pitch ?? 0,
      bearing: step.bearing ?? 0,
      speed: step.speed ?? 0.8,
      curve: 1.42,
      essential: true,
    })

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add highlight marker if specified
    if (step.highlight) {
      const { coordinates, label, color = 'var(--color-accent, #D85A30)', radius = 12 } = step.highlight

      // Pulsing dot element
      const el = document.createElement('div')
      el.className = 'mapbox-highlight-marker'
      el.style.cssText = `
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        border-radius: 50%;
        background: ${color};
        opacity: 0.85;
        box-shadow: 0 0 0 0 ${color};
        animation: mapbox-pulse 2s ease-out infinite;
      `

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coordinates)
        .addTo(map)

      // Optional label popup
      if (label) {
        const popup = new maplibregl.Popup({
          offset: radius + 8,
          closeButton: false,
          closeOnClick: false,
          className: 'mapbox-highlight-popup',
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
          ">${label}</div>`
        )
        marker.setPopup(popup).togglePopup()
      }

      markersRef.current.push(marker)
    }
  }, [activeStep, steps, loaded])

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
        .mapbox-highlight-popup .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapbox-highlight-popup .maplibregl-popup-tip {
          display: none !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          minHeight: 420,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </>
  )
}
