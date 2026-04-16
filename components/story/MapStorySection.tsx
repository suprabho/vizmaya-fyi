'use client'

import type { ResolvedUnit } from '@/lib/storyConfig.types'
import { formatInlineMarkdown } from '@/lib/formatInlineMarkdown'
import { HeroPanel, HeroPanelTitle, HeroPanelDek } from './Hero'

interface Props {
  unitIndex: number
  unit: ResolvedUnit
}

/**
 * Pull a `*italic dek*` line and a `**bold byline**` line out of the
 * paragraphs returned for a hero section. Falls back to plain paragraphs
 * if the markers aren't present.
 */
function extractHeroBits(paragraphs: string[]): { dek: string; byline: string } {
  const dek =
    paragraphs.find((p) => /^\*[^*]/.test(p))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  const byline =
    paragraphs.find((p) => p.startsWith('**'))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  return { dek, byline }
}

/**
 * One viewport-tall snap target.
 *
 * Renders ONLY the text panel — the chart and map are page-level fixed
 * panels owned by StoryMapShell, so they persist across subsections of the
 * same parent (allowing chart animations to resume rather than re-mount).
 *
 * Landscape layout:
 *   - With a chart: chart panel occupies the top half of the right 63vw
 *     column (h-[50vh]); text card stacks directly beneath it in the
 *     bottom half (top-[50vh], h-[50vh]). Left 37vw stays clear for the
 *     map focal area.
 *   - Without a chart: text card claims the right 63vw × full-height slot
 *     (mirroring the chart position), so hero titles, stat numbers, and
 *     act intros use the same prime real estate the graph would have. The
 *     bottom-left 37% × 60% region stays clear for the map focal area.
 *
 * Portrait layout: text card centered below the top-pinned chart strip
 * (or centered with no top strip when chartless).
 */
export default function MapStorySection({ unitIndex, unit }: Props) {
  const { parentConfig, heading, subheading, paragraphs } = unit
  const kind = parentConfig.kind ?? 'text'
  const heroBits = kind === 'hero' ? extractHeroBits(paragraphs) : null
  const hasChart = !!parentConfig.chart

  // Two static class strings — Tailwind v4 JIT picks both up because they
  // appear literally in the source. Selected at render time.
  const landscapeSlotClasses = hasChart
    ? // Bottom-right 63vw × 50vh — sits directly beneath the chart panel
      // (which owns the top 50vh of the same right column).
      [
        '[@media(min-aspect-ratio:1/1)]:left-auto',
        '[@media(min-aspect-ratio:1/1)]:right-0',
        '[@media(min-aspect-ratio:1/1)]:top-[50vh]',
        '[@media(min-aspect-ratio:1/1)]:translate-x-0',
        '[@media(min-aspect-ratio:1/1)]:w-[63vw]',
        '[@media(min-aspect-ratio:1/1)]:h-[50vh]',
        '[@media(min-aspect-ratio:1/1)]:p-10',
      ]
    : // Right 63vw × full-height — reuses the chart slot.
      [
        '[@media(min-aspect-ratio:1/1)]:left-auto',
        '[@media(min-aspect-ratio:1/1)]:right-0',
        '[@media(min-aspect-ratio:1/1)]:top-0',
        '[@media(min-aspect-ratio:1/1)]:translate-x-0',
        '[@media(min-aspect-ratio:1/1)]:w-[63vw]',
        '[@media(min-aspect-ratio:1/1)]:h-screen',
        '[@media(min-aspect-ratio:1/1)]:p-10',
      ]

  const cardClasses = [
    'absolute rounded-lg p-6 backdrop-blur-sm overflow-y-auto',
    'left-1/2 -translate-x-1/2 bottom-4',
    'w-[90vw] max-w-[640px] max-h-[50vh]',
    ...landscapeSlotClasses,
    '[@media(min-aspect-ratio:1/1)]:max-w-none',
    '[@media(min-aspect-ratio:1/1)]:max-h-none',
  ].join(' ')

  const cardStyle = {
    background: 'rgba(10, 14, 20, 0.2)',
    border: '0.5px solid var(--color-line, #1a2830)',
  }

  // Hero splits into two snap sections on portrait (mobile).
  // On landscape the full HeroPanel stays in a single section.
  if (kind === 'hero' && heading) {
    return (
      <>
        <section
          data-unit-index={unitIndex}
          className="snap-start snap-always h-screen w-full relative"
        >
          <div className={cardClasses} style={cardStyle}>
            <div className="max-w-[820px] mx-auto h-full flex flex-col justify-center">
              {/* Landscape: full hero */}
              <div className="hidden [@media(min-aspect-ratio:1/1)]:block">
                <HeroPanel
                  title={heading}
                  dek={heroBits?.dek ?? ''}
                  byline={heroBits?.byline ?? ''}
                  eyebrow={parentConfig.eyebrow}
                />
              </div>
              {/* Portrait: eyebrow + title only */}
              <div className="[@media(min-aspect-ratio:1/1)]:hidden">
                <HeroPanelTitle title={heading} eyebrow={parentConfig.eyebrow} />
              </div>
            </div>
          </div>
        </section>

        {/* Portrait-only second snap section: dek + byline */}
        <section
          data-unit-index={unitIndex}
          className="snap-start snap-always h-screen w-full relative [@media(min-aspect-ratio:1/1)]:hidden"
        >
          <div className={cardClasses} style={cardStyle}>
            <div className="max-w-[820px] mx-auto h-full flex flex-col justify-center">
              <HeroPanelDek dek={heroBits?.dek ?? ''} byline={heroBits?.byline ?? ''} />
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <section
      data-unit-index={unitIndex}
      className="snap-start snap-always h-screen w-full relative"
    >
      <div className={cardClasses} style={cardStyle}>
        <div className="max-w-[820px] mx-auto h-full flex flex-col justify-center">
          {kind === 'stat' && heading ? (
            <StatPanel value={heading} subheading={subheading} description={paragraphs.join(' ')} />
          ) : (
            <TextPanel
              heading={heading}
              paragraphs={paragraphs}
              anchorMiss={parentConfig.text ?? '(no anchor)'}
            />
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Sub-panels ────────────────────────────────────────────────────── */

function TextPanel({
  heading,
  paragraphs,
  anchorMiss,
}: {
  heading: string | undefined
  paragraphs: string[]
  anchorMiss: string
}) {
  return (
    <>
      {heading && (
        <div
          className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-3"
          style={{ color: 'var(--color-accent)' }}
        >
          {heading}
        </div>
      )}
      {paragraphs.length > 0 ? (
        paragraphs.map((p, i) => (
          <p
            key={i}
            className="font-[family-name:var(--font-serif)] text-[1rem] leading-[1.7] mb-3 last:mb-0"
            style={{ color: 'var(--color-text)' }}
          >
            {formatInlineMarkdown(p)}
          </p>
        ))
      ) : (
        <p
          className="font-[family-name:var(--font-mono)] text-[0.7rem] opacity-60"
          style={{ color: 'var(--color-muted, #aca286)' }}
        >
          [missing markdown anchor: {anchorMiss}]
        </p>
      )}
    </>
  )
}

/**
 * `kind: stat` — display the section's heading as a giant number with the
 * body text as caption beneath. Mirrors the legacy StatBlock visual.
 * Color is red for percentages, accent2 otherwise.
 */
function StatPanel({ value, subheading, description }: { value: string; subheading?: string; description: string }) {
  const isPercentage = value.includes('%')
  const color = isPercentage ? 'var(--color-red, #E24B4A)' : 'var(--color-accent2)'

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div
        className="font-serif text-[clamp(3.5rem,11vw,7.5rem)] font-bold leading-none mb-3"
        style={{ color }}
      >
        {value}
      </div>
      {subheading && (
        <div
          className="font-mono text-[0.65rem] uppercase tracking-[0.15em] mb-3"
          style={{ color: 'var(--color-accent)' }}
        >
          {subheading}
        </div>
      )}
      <div
        className="font-sans text-[0.95rem] max-w-[440px] leading-[1.55]"
        style={{ color: 'var(--color-muted)' }}
      >
        {description}
      </div>
    </div>
  )
}
