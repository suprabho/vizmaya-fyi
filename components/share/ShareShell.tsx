'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ResolvedUnit, StoryConfig, ShareSectionOverride } from '@/lib/storyConfig.types'
import AspectRatioToggle, { type AspectRatio } from './AspectRatioToggle'
import ShareCard, { type ShareCardHandle, type CardVariant } from './ShareCard'

interface Props {
  slug: string
  units: ResolvedUnit[]
  config: StoryConfig
  title: string
  accessToken: string
  shareOverrides: Record<string, ShareSectionOverride> | null
}

/**
 * Compute the maximum subIndex for each parentIndex, used to set
 * the chart's final activeStep for the most complete data view.
 */
function computeMaxSubIndices(units: ResolvedUnit[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const u of units) {
    const current = map.get(u.parentIndex) ?? 0
    if (u.subIndex > current) map.set(u.parentIndex, u.subIndex)
  }
  return map
}

interface CardEntry {
  unit: ResolvedUnit
  variant: CardVariant
  label: string
}

/**
 * Build the list of cards to render. Each section gets a map-title card
 * (using its own map config) followed by its content card. Subsections
 * sharing the same parentIndex share one map slide — only the first
 * subsection emits the map-title card. Sections with `hide: true` in
 * share overrides are skipped entirely.
 */
function sliceShareParagraphs(
  all: string[],
  spec: number | [number, number]
): string[] {
  if (typeof spec === 'number') return all.slice(spec, spec + 1)
  return all.slice(spec[0], spec[1])
}

/** Normalize a paragraphsOverride entry to a string[] (one card's paragraphs). */
function normalizeOverrideEntry(entry: string | string[]): string[] {
  return typeof entry === 'string' ? [entry] : entry
}

function buildCardList(
  units: ResolvedUnit[],
  overrides: Record<string, ShareSectionOverride> | null
): CardEntry[] {
  const cards: CardEntry[] = []
  const seenParentsForMap = new Set<number>()
  const seenParentsForGraph = new Set<number>()
  for (const unit of units) {
    const sectionId = unit.parentConfig.id
    if (sectionId && overrides?.[sectionId]?.hide) continue

    const kind = unit.parentConfig.kind ?? 'text'
    const hasChart = !!unit.parentConfig.chart
    const shareOverride = sectionId ? overrides?.[sectionId] : undefined

    // 1. Map + Heading — emitted for the first unit of each parent (using
    // the parent map view) AND for any subsequent subsection that defines
    // its own `map` override (zoomed-in subsection view).
    const subsectionConfig = unit.parentConfig.subsections?.[unit.subIndex]
    const hasSubsectionMap = !!subsectionConfig?.map
    const isFirstForParent = !seenParentsForMap.has(unit.parentIndex)
    if (isFirstForParent || hasSubsectionMap) {
      if (isFirstForParent) seenParentsForMap.add(unit.parentIndex)
      cards.push({ unit, variant: 'map-title', label: 'map-title' })
    }

    // 2. Graph — one per parent section when a chart is configured.
    // Renders with activeStep=maxSubIndex for the most complete data view.
    if (hasChart && !seenParentsForGraph.has(unit.parentIndex)) {
      seenParentsForGraph.add(unit.parentIndex)
      cards.push({ unit, variant: 'graph', label: 'graph' })
    }

    // 3. Content cards.
    // Per-subsection overrides take precedence over section-level overrides —
    // needed when a parent has multiple subsections and only one is rewritten.
    const subOverride = shareOverride?.subsections?.[unit.subIndex]
    const paragraphsOverride =
      subOverride?.paragraphsOverride ?? shareOverride?.paragraphsOverride
    const shareParagraphs =
      subOverride?.shareParagraphs ?? shareOverride?.shareParagraphs
    const hasSplitOverride =
      (paragraphsOverride && paragraphsOverride.length > 0) ||
      (shareParagraphs && shareParagraphs.length > 0)

    // Hero/stat render as a single card by default — the variant itself
    // shapes their content. A share override may still split them.
    if (kind !== 'text' && !hasSplitOverride) {
      cards.push({ unit, variant: 'auto', label: kind })
      continue
    }

    // Stat/hero split cards keep their heading (big number / title) on every
    // card so each one renders with the same variant treatment and stands
    // alone on social. Text cards drop the heading after the first card so
    // subsequent cards read as paragraph continuations.
    const keepHeadingOnAll = kind !== 'text'

    if (paragraphsOverride && paragraphsOverride.length > 0) {
      paragraphsOverride.forEach((entry, sliceIdx) => {
        const expandedUnit: ResolvedUnit = {
          ...unit,
          heading: keepHeadingOnAll || sliceIdx === 0 ? unit.heading : undefined,
          paragraphs: normalizeOverrideEntry(entry),
        }
        cards.push({ unit: expandedUnit, variant: 'auto', label: kind })
      })
    } else if (shareParagraphs && shareParagraphs.length > 0) {
      shareParagraphs.forEach((spec, sliceIdx) => {
        const expandedUnit: ResolvedUnit = {
          ...unit,
          heading: keepHeadingOnAll || sliceIdx === 0 ? unit.heading : undefined,
          paragraphs: sliceShareParagraphs(unit.paragraphs, spec),
        }
        cards.push({ unit: expandedUnit, variant: 'auto', label: kind })
      })
    } else if (unit.paragraphs.length === 0) {
      cards.push({ unit, variant: 'auto', label: kind })
    } else {
      unit.paragraphs.forEach((p, idx) => {
        const expandedUnit: ResolvedUnit = {
          ...unit,
          heading: idx === 0 ? unit.heading : undefined,
          paragraphs: [p],
        }
        cards.push({ unit: expandedUnit, variant: 'auto', label: kind })
      })
    }
  }
  return cards
}

export default function ShareShell({ slug, units, config, title, accessToken, shareOverrides }: Props) {
  const [ratio, setRatio] = useState<AspectRatio>('3:4')
  const [downloading, setDownloading] = useState(false)
  const cardRefs = useRef<(ShareCardHandle | null)[]>([])
  const maxSubIndices = computeMaxSubIndices(units)
  const cards = useMemo(() => buildCardList(units, shareOverrides), [units, shareOverrides])

  const handleDownloadAll = useCallback(async () => {
    setDownloading(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < cards.length; i++) {
        const handle = cardRefs.current[i]
        if (!handle) continue
        const dataUrl = await handle.capture()
        if (!dataUrl) continue
        // Convert data URL to binary
        const base64 = dataUrl.split(',')[1]
        zip.file(`${slug}-${i + 1}-${ratio.replace(':', 'x')}.png`, base64, { base64: true })
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `${slug}-share-${ratio.replace(':', 'x')}.zip`)
    } catch (err) {
      console.error('Bulk download failed:', err)
    } finally {
      setDownloading(false)
    }
  }, [slug, ratio, cards])

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ borderColor: 'var(--color-surface)', background: 'rgb(var(--color-bg-rgb) / 0.85)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <a
              href={`/story/${slug}`}
              className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text)' }}
            >
              &larr; Story
            </a>
            <h1
              className="font-[family-name:var(--font-serif)] text-lg font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Share
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <AspectRatioToggle value={ratio} onChange={setRatio} />
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="px-4 py-1.5 rounded-md font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-wider transition-opacity disabled:opacity-50"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }}
            >
              {downloading ? 'Exporting...' : 'Download All'}
            </button>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-6 justify-center">
          {cards.map((card, i) => (
            <ShareCard
              key={`${i}-${card.variant}-${ratio}`}
              ref={(el) => { cardRefs.current[i] = el }}
              unit={card.unit}
              index={i}
              ratio={ratio}
              slug={slug}
              title={title}
              accessToken={accessToken}
              maxSubIndex={maxSubIndices.get(card.unit.parentIndex) ?? 0}
              variant={card.variant}
              shareOverride={card.unit.parentConfig.id ? shareOverrides?.[card.unit.parentConfig.id] : undefined}
              palette={config.defaults.mapPalette}
              fontstack={config.defaults.mapFontstack}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
