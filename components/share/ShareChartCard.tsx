'use client'

import ChartPanel from '@/components/story/ChartPanel'

interface Props {
  chartId: string
  activeStep: number
}

/**
 * Renders an ECharts chart at a specific activeStep for share mode.
 * Charts use SVG renderer so they capture cleanly with html-to-image.
 */
export default function ShareChartCard({ chartId, activeStep }: Props) {
  return (
    <div className="w-full h-full">
      <ChartPanel chartId={chartId} activeStep={activeStep} />
    </div>
  )
}
