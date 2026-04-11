'use client'

import { useMemo } from 'react'
import type { MapPinConfig } from '@/lib/storyConfig.types'

interface Props {
  center: [number, number]
  zoom: number
  pitch?: number
  bearing?: number
  width: number
  height: number
  style?: string
  accessToken: string
  pins?: MapPinConfig[]
}

/**
 * Encode a hex color for Mapbox Static marker overlay.
 * Strips the leading # since the API expects bare hex.
 */
function pinColor(color?: string): string {
  return (color ?? '#E24B4A').replace('#', '')
}

/**
 * Build the Mapbox Static Images overlay string for pins.
 * Format: pin-s+{color}({lng},{lat})
 * Multiple pins are comma-separated before the /center path.
 */
function buildPinOverlay(pins: MapPinConfig[]): string {
  return pins
    .map((p) => `pin-s+${pinColor(p.color)}(${p.coordinates[0]},${p.coordinates[1]})`)
    .join(',')
}

/**
 * Renders a Mapbox Static Images API <img> as a card background.
 * Includes pin markers as overlay when provided.
 */
export default function ShareMapBg({
  center,
  zoom,
  pitch = 0,
  bearing = 0,
  width,
  height,
  style = 'mapbox://styles/mapbox/dark-v11',
  accessToken,
  pins,
}: Props) {
  const styleId = style.replace('mapbox://styles/', '')

  // Static Images API caps at 1280x1280 — request max and let CSS scale
  const reqW = Math.min(width, 1280)
  const reqH = Math.min(height, 1280)

  const url = useMemo(() => {
    const overlay = pins && pins.length > 0 ? `${buildPinOverlay(pins)}/` : ''
    const mapboxUrl = `https://api.mapbox.com/styles/v1/${styleId}/static/${overlay}${center[0]},${center[1]},${zoom},${bearing},${pitch}/${reqW}x${reqH}@2x?access_token=${accessToken}`
    // Route through our same-origin proxy so html-to-image can clone and
    // re-fetch the background without cross-origin canvas tainting. The
    // proxy sets long-lived Cache-Control headers, so Vercel's edge CDN
    // serves repeat requests without re-hitting the Mapbox API.
    return `/api/mapbox-bg?url=${encodeURIComponent(mapboxUrl)}`
  }, [styleId, center[0], center[1], zoom, bearing, pitch, reqW, reqH, accessToken, pins])

  return (
    <img
      src={url}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.55 }}
    />
  )
}
