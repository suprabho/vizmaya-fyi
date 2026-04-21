'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MapPinConfig } from '@/lib/storyConfig.types'
import type { MapRegionLayer, HeatmapLayer, MapStep } from '@/types/story'
import MapboxBackground from '@/components/story/charts/MapboxBackground'

interface Props {
  center: [number, number]
  zoom: number
  pitch?: number
  bearing?: number
  style?: string
  accessToken: string
  pins?: MapPinConfig[]
  regions?: MapRegionLayer
  heatmap?: HeatmapLayer
  onReady?: () => void
}

/**
 * Share-mode map background. Renders the same Mapbox GL layers the story
 * itself uses (pins, labels, choropleth regions, heatmap) so share cards
 * match the live story. `preserveDrawingBuffer` is enabled so html-to-image
 * can snapshot the canvas; fly animation is skipped so the capture fires at
 * the final pose.
 *
 * A share page can have dozens of cards. Each Mapbox GL instance claims its
 * own WebGL context, and browsers cap simultaneous contexts at ~8–16. If
 * we mount all of them at once, the later maps never finish loading. So we
 * only mount the map when the card is visible (IntersectionObserver), and
 * keep it mounted from then on so capture still works after the card has
 * scrolled back off.
 */
export default function ShareMapBg({
  center,
  zoom,
  pitch = 0,
  bearing = 0,
  style = 'mapbox://styles/mapbox/dark-v11',
  accessToken,
  pins,
  regions,
  heatmap,
  onReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = hostRef.current
    if (!el || mounted) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mounted])

  // Share cards render at 390px wide — much smaller than the interactive
  // viewport — so scale configured pin radii up a bit to keep them readable.
  const SHARE_PIN_SCALE = 1.6
  const scaledPins = useMemo(
    () =>
      pins?.map((p) => ({
        ...p,
        radius: Math.round((p.radius ?? 10) * SHARE_PIN_SCALE),
      })),
    [pins]
  )

  const steps: MapStep[] = useMemo(
    () => [
      {
        center,
        zoom,
        pitch,
        bearing,
        pins: scaledPins,
        regions,
        heatmap,
      },
    ],
    [center, zoom, pitch, bearing, scaledPins, regions, heatmap]
  )

  return (
    <div ref={hostRef} className="absolute inset-0" style={{ opacity: 0.9 }}>
      {mounted && (
        <MapboxBackground
          accessToken={accessToken}
          steps={steps}
          activeStep={0}
          style={style}
          interactive={false}
          staticCapture
          onReady={onReady}
        />
      )}
    </div>
  )
}
