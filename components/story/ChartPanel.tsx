'use client'

import KoreaBarChart from './charts/KoreaBarChart'
import HeliumPriceChart from './charts/HeliumPriceChart'
import FeedbackLoopDiagram from './charts/FeedbackLoopDiagram'
import DRAMPriceChart from './charts/DRAMPriceChart'
import StockCandlestickChart from './charts/StockCandlestickChart'
import PolarExposureChart from './charts/PolarExposureChart'
import HBMDRAMTreemap from './charts/HBMDRAMTreemap'
import LNGCarrierTreemap from './charts/LNGCarrierTreemap'
import QatarPlantMap from './charts/QatarPlantMap'
import DDR5AreaChart from './charts/DDR5AreaChart'

/**
 * Foreground chart registry. Maps a string id (used in YAML config or
 * ScrollySection blocks) to its chart component. The persistent map
 * background is NOT in this registry — it lives at page level.
 */
export default function ChartPanel({
  chartId,
  activeStep = 0,
}: {
  chartId?: string
  activeStep?: number
}) {
  switch (chartId) {
    case 'stock-candlestick':
      return <StockCandlestickChart activeStep={activeStep} />
    case 'polar-exposure':
      return <PolarExposureChart activeStep={activeStep} />
    case 'hbm-treemap':
      return <HBMDRAMTreemap activeStep={activeStep} />
    case 'lng-treemap':
      return <LNGCarrierTreemap activeStep={activeStep} />
    case 'qatar-map':
      return <QatarPlantMap activeStep={activeStep} />
    case 'ddr5-area':
      return <DDR5AreaChart activeStep={activeStep} />
    case 'korea-bar':
      return <KoreaBarChart activeStep={activeStep} />
    case 'helium-price':
      return <HeliumPriceChart activeStep={activeStep} />
    case 'feedback-loop':
      return <FeedbackLoopDiagram activeStep={activeStep} />
    case 'dram-price':
      return <DRAMPriceChart activeStep={activeStep} />
    default:
      return null
  }
}
