'use client'

import { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react'
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

export type CardVariant = 'auto' | 'map-title'

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
  const { w, h } = RENDER_SIZE[ratio]
  const output = OUTPUT_SIZE[ratio]
  const pixelRatio = output.w / w
  const { parentConfig, paragraphs } = unit
  const heading = shareOverride?.heading ?? unit.heading
  const kind = parentConfig.kind ?? 'text'
  const hasChart = !!parentConfig.chart
  const isMapTitle = variant === 'map-title'
  // Only show map bg on hero cards and map-title variant
  const showMap = !!parentConfig.map?.center && (kind === 'hero' || isMapTitle)

  // Resolve map properties — share override > parent config
  const mapCenter = shareOverride?.map?.center ?? parentConfig.map?.center
  const mapZoom = shareOverride?.map?.zoom ?? parentConfig.map?.zoom
  const mapPitch = shareOverride?.map?.pitch ?? parentConfig.map?.pitch
  const mapBearing = shareOverride?.map?.bearing ?? parentConfig.map?.bearing

  // Collect all pins for this section: share override pins (if set, replaces all),
  // otherwise parent pins + all subsection pins
  const allPins = useMemo(() => {
    if (shareOverride?.map?.pins) return shareOverride.map.pins

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
  }, [parentConfig, shareOverride])

  const capture = useCallback(async (): Promise<string | null> => {
    const node = captureRef.current
    if (!node) return null
    try {
      await document.fonts.ready

      // Wait for every <img> in the capture target (notably the Mapbox
      // static background, served via /api/mapbox-bg) to finish loading
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
  }, [w, h, pixelRatio])

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
              width={output.w}
              height={output.h}
              accessToken={accessToken}
              pins={allPins}
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
            ) : hasChart ? (
              /* Chart + text composite layout */
              <>
                <div className="flex-1 min-h-0">
                  <ShareChartCard
                    chartId={parentConfig.chart!}
                    activeStep={unit.subIndex}
                  />
                </div>
                <div className="px-6 py-4">
                  {heading && (
                    <div
                      className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.15em] mb-2"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {heading}
                    </div>
                  )}
                  {paragraphs.length > 0 && (
                    <p
                      className="font-[family-name:var(--font-serif)] text-[0.85rem] leading-[1.6] line-clamp-3"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {paragraphs[0]}
                    </p>
                  )}
                </div>
              </>
            ) : kind === 'hero' && heading ? (
              <ShareHeroCard
                title={heading}
                eyebrow={parentConfig.eyebrow}
              />
            ) : kind === 'stat' && heading ? (
              <ShareStatCard
                value={heading}
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
