'use client'

import ChartPanel from '@/components/story/ChartPanel'

interface Props {
  chartId: string
  activeStep: number
  slug: string
  heading?: string
  subheading?: string
}

/**
 * Renders an ECharts chart at a specific activeStep for share mode.
 * Charts use SVG renderer so they capture cleanly with html-to-image.
 *
 * Optional heading/subheading sit above the chart and are configured via
 * the per-chart-card `chart` slot in share overrides — kept separate from
 * the map-title and content cards that share the same section/subsection
 * scope so each card can carry its own copy.
 */
export default function ShareChartCard({ chartId, activeStep, slug, heading, subheading }: Props) {
  const hasText = !!(heading || subheading)
  return (
    <div className="w-full h-full flex flex-col pt-8">
      <div className="flex-1 min-h-0">
        <ChartPanel chartId={chartId} activeStep={activeStep} slug={slug} />
      </div>
      {hasText && (
        <div className="px-6 py-6">
          {heading && (
            <h2
              className="font-serif text-[1.6rem] font-bold leading-[1.2]"
              style={{ color: 'var(--color-accent)' }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p
              className="text-[0.85rem] leading-[1.4] mt-2"
              style={{ color: 'var(--color-muted)' }}
            >
              {subheading}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
