'use client'

import { useRef, useCallback, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { toPng } from 'html-to-image'
import type { ResolvedUnit, MapPinConfig, ShareSectionOverride } from '@/lib/storyConfig.types'
import type { AspectRatio } from './AspectRatioToggle'
import ShareTextCard from './ShareTextCard'
import ShareStatCard from './ShareStatCard'
import ShareHeroCard from './ShareHeroCard'
import ShareChartCard from './ShareChartCard'
import ShareMapBg from './ShareMapBg'
import BrandingHeader from './BrandingFooter'

/**
 * DOM render size — matches mobile proportions so text looks natural.
 * The exported image is scaled up via pixelRatio to hit the target output.
 *
 * Output targets:
 *   1:1 → 1080×1080  (pixelRatio ≈ 2.77)
 *   3:4 → 1080×1440  (pixelRatio ≈ 2.77)
 *   4:3 → 1440×1080  (pixelRatio ≈ 2.77)
 */
const BASE = 390

const RENDER_SIZE: Record<AspectRatio, { w: number; h: number }> = {
  '1:1': { w: BASE, h: BASE },
  '3:4': { w: BASE, h: BASE * (4 / 3) },
  '4:3': { w: BASE * (4 / 3), h: BASE },
}

const OUTPUT_SIZE: Record<AspectRatio, { w: number; h: number }> = {
  '1:1': { w: 1080, h: 1080 },
  '3:4': { w: 1080, h: 1440 },
  '4:3': { w: 1440, h: 1080 },
}

export type CardVariant = 'auto' | 'map-title' | 'graph'

interface Props {
  unit: ResolvedUnit
  index: number
  ratio: AspectRatio
  slug: string
  title: string
  accessToken: string
  /** Maximum subsection index for this parent (for chart final step) */
  maxSubIndex: number
  /** Card variant — 'auto' picks by section kind, 'map-title' forces map + title overlay */
  variant?: CardVariant
  /** Per-section overrides from share config */
  shareOverride?: ShareSectionOverride
}

export interface ShareCardHandle {
  capture: () => Promise<string | null>
}

/**
 * Extract hero dek and byline from paragraphs (matches MapStorySection logic).
 */
function extractHeroBits(paragraphs: string[]): { dek: string; byline: string } {
  const dek =
    paragraphs.find((p) => /^\*[^*]/.test(p))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  const byline =
    paragraphs.find((p) => p.startsWith('**'))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  return { dek, byline }
}

const ShareCard = forwardRef<ShareCardHandle, Props>(function ShareCard(
  { unit, index, ratio, slug, title, accessToken, maxSubIndex, variant = 'auto', shareOverride },
  ref
) {
  const captureRef = useRef<HTMLDivElement>(null)
  const mapReadyRef = useRef(false)
  const mapReadyResolvers = useRef<Array<() => void>>([])
  const [, setMapReadyTick] = useState(0)
  const handleMapReady = useCallback(() => {
    mapReadyRef.current = true
    for (const r of mapReadyResolvers.current) r()
    mapReadyResolvers.current = []
    setMapReadyTick((t) => t + 1)
  }, [])
  const waitForMap = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (mapReadyRef.current) resolve()
        else mapReadyResolvers.current.push(resolve)
      }),
    []
  )
  const { w, h } = RENDER_SIZE[ratio]
  const output = OUTPUT_SIZE[ratio]
  const pixelRatio = output.w / w
  const { parentConfig, paragraphs, subheading } = unit
  const heading = shareOverride?.heading ?? unit.heading
  const kind = parentConfig.kind ?? 'text'
  const hasChart = !!parentConfig.chart
  const isMapTitle = variant === 'map-title'
  const isGraph = variant === 'graph'
  // Only show map bg on hero cards and map-title variant
  const showMap = !!parentConfig.map?.center && (kind === 'hero' || isMapTitle)

  // Resolve map properties — share override > subsection override > parent config.
  // The subsection override only applies when this card represents a specific
  // subsection (i.e. the unit has a subIndex pointing at a configured subsection).
  const subsectionMap = parentConfig.subsections?.[unit.subIndex]?.map
  const mapCenter = shareOverride?.map?.center ?? subsectionMap?.center ?? parentConfig.map?.center
  const mapZoom = shareOverride?.map?.zoom ?? subsectionMap?.zoom ?? parentConfig.map?.zoom
  const mapPitch = shareOverride?.map?.pitch ?? subsectionMap?.pitch ?? parentConfig.map?.pitch
  const mapBearing = shareOverride?.map?.bearing ?? subsectionMap?.bearing ?? parentConfig.map?.bearing
  // Regions and heatmap: subsection replaces parent (if defined), else fall back.
  const mapRegions = subsectionMap?.regions ?? parentConfig.map?.regions
  const mapHeatmap = subsectionMap?.heatmap ?? parentConfig.map?.heatmap

  // Collect pins for this card:
  //   • share override pins (if set, replaces all)
  //   • else if this is a subsection map card with its own pins, use just those
  //     (the subsection is a zoomed-in scoped view)
  //   • else union of parent pins + all subsection pins (the parent overview card)
  const allPins = useMemo(() => {
    if (shareOverride?.map?.pins) return shareOverride.map.pins
    if (subsectionMap?.pins) return subsectionMap.pins

    const pins: MapPinConfig[] = []
    if (parentConfig.map?.pins) pins.push(...parentConfig.map.pins)
    if (parentConfig.subsections) {
      for (const sub of parentConfig.subsections) {
        if (sub.map?.pins) pins.push(...sub.map.pins)
      }
    }
    // Deduplicate by coordinates
    const seen = new Set<string>()
    return pins.filter((p) => {
      const key = `${p.coordinates[0]},${p.coordinates[1]}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [parentConfig, shareOverride, subsectionMap])

  const capture = useCallback(async (): Promise<string | null> => {
    const node = captureRef.current
    if (!node) return null
    try {
      await document.fonts.ready

      // Wait for the Mapbox GL map to finish loading its style, tiles,
      // region layer (for custom GeoJSON this includes the fetch) and
      // go idle. Without this, toPng rasterizes an empty canvas or a
      // map without regions drawn.
      if (showMap) {
        // The map is mounted lazily via IntersectionObserver to stay under
        // the browser's WebGL context cap. Scroll the card into view so its
        // observer fires before we start waiting.
        node.scrollIntoView({ block: 'center', behavior: 'auto' })
        await waitForMap()
        // One extra rAF so popup DOM elements have a chance to lay out
        // their final position after the map resolves.
        await new Promise<void>((r) => requestAnimationFrame(() => r()))
      }

      // Wait for every <img> in the capture target to finish loading
      // before snapshotting. html-to-image clones the node and re-fetches
      // each src; if the image hasn't resolved yet the cloned <img>
      // rasterizes empty.
      const imgs = Array.from(node.querySelectorAll('img'))
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return img.decode().catch(() => undefined)
          }
          return new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
        })
      )

      const dataUrl = await toPng(node, {
        width: w,
        height: h,
        pixelRatio,
        backgroundColor: getComputedStyle(node).getPropertyValue('--color-bg').trim() || '#052f4a',
        filter: (el) => {
          // Hide download buttons during capture
          if (el instanceof HTMLElement && el.dataset.shareUi === 'true') return false
          return true
        },
      })
      return dataUrl
    } catch (err) {
      console.error('Share card capture failed:', err)
      return null
    }
  }, [w, h, pixelRatio, showMap, waitForMap])

  useImperativeHandle(ref, () => ({ capture }), [capture])

  const handleDownload = useCallback(async () => {
    const dataUrl = await capture()
    if (!dataUrl) return
    const link = document.createElement('a')
    link.download = `${slug}-${index + 1}-${ratio.replace(':', 'x')}.png`
    link.href = dataUrl
    link.click()
  }, [capture, slug, index, ratio])

  return (
    <div className="relative group" style={{ width: w, height: h }}>
      {/* Capture target — rendered at mobile-like size, exported at high pixelRatio */}
      <div
        ref={captureRef}
        className="relative overflow-hidden rounded-lg"
        style={{
          width: w,
          height: h,
          background: 'var(--color-bg)',
        }}
      >
          {/* Map background layer — only on hero and map-title cards */}
          {showMap && (
            <ShareMapBg
              center={mapCenter!}
              zoom={mapZoom!}
              pitch={mapPitch}
              bearing={mapBearing}
              accessToken={accessToken}
              pins={allPins}
              regions={mapRegions}
              heatmap={mapHeatmap}
              onReady={handleMapReady}
            />
          )}

          {/* Content layer */}
          <div className="relative z-10 h-full flex flex-col">
            {isMapTitle ? (
              /* Map + section heading overlay card */
              <div className="flex flex-col justify-end h-full px-6 py-6"
                style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }}
              >
                {parentConfig.eyebrow && (
                  <div
                    className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-2"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {parentConfig.eyebrow}
                  </div>
                )}
                <h2
                  className="font-serif text-[1.6rem] font-bold leading-[1.2]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {heading || title}
                </h2>
                {kind === 'hero' && (() => {
                  const { dek, byline } = extractHeroBits(paragraphs)
                  return (
                    <>
                      {dek && (
                        <p
                          className="text-[0.8rem] leading-[1.4] mt-3 max-w-[80%]"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          {dek}
                        </p>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : isGraph && hasChart ? (
              /* Chart-only card — renders final data view via maxSubIndex */
              <div className="h-full min-h-0">
                <ShareChartCard
                  chartId={parentConfig.chart!}
                  activeStep={maxSubIndex}
                  slug={slug}
                />
              </div>
            ) : kind === 'hero' && heading ? (
              <ShareHeroCard
                title={heading}
                eyebrow={parentConfig.eyebrow}
              />
            ) : kind === 'stat' && heading ? (
              <ShareStatCard
                value={heading}
                subheading={subheading}
                description={paragraphs.join(' ')}
              />
            ) : (
              <ShareTextCard heading={heading} paragraphs={paragraphs} />
            )}
          </div>

          {/* Branding header */}
          <BrandingHeader title={title} />
        </div>

      {/* Download button overlay — hidden during capture */}
      <button
        data-share-ui="true"
        onClick={handleDownload}
        className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        <div
          className="rounded-lg px-4 py-2 font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-wider"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          Download PNG
        </div>
      </button>
    </div>
  )
})

export default ShareCard
