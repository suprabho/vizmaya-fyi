'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { ScrollySectionBlock } from '@/types/story'
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
import dynamic from 'next/dynamic'

const MapboxBackground = dynamic(() => import('./charts/MapboxBackground'), { ssr: false })

function formatInlineMarkdown(text: string) {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/)
    const firstMatch = [boldMatch, italicMatch]
      .filter(Boolean)
      .sort((a, b) => (a!.index ?? 0) - (b!.index ?? 0))[0]

    if (!firstMatch || firstMatch.index === undefined) {
      parts.push(remaining)
      break
    }

    if (firstMatch.index > 0) parts.push(remaining.slice(0, firstMatch.index))

    if (firstMatch === boldMatch) {
      parts.push(
        <span
          key={key++}
          className="font-[family-name:var(--font-mono)] font-bold"
          style={{ color: 'var(--color-accent)' }}
        >
          {firstMatch[1]}
        </span>
      )
    } else {
      parts.push(<em key={key++}>{firstMatch[1]}</em>)
    }
    remaining = remaining.slice(firstMatch.index + firstMatch[0].length)
  }

  return parts
}

function ChartPanel({ chartId, activeStep, mapSteps }: { chartId?: string; activeStep: number; mapSteps?: import('./charts/MapboxBackground').MapStep[] }) {
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
    case 'mapbox-globe':
      return (
        <MapboxBackground
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
          steps={mapSteps ?? []}
          activeStep={activeStep}
        />
      )
    default:
      return null
  }
}

export default function ScrollySection({ block }: { block: ScrollySectionBlock }) {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])
  const hasChart = !!block.chartId

  // GSAP ScrollTrigger for step detection + card entrance animations
  useEffect(() => {
    let gsapModule: typeof import('gsap') | null = null
    let ScrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null
    const triggers: import('gsap/ScrollTrigger').ScrollTrigger[] = []

    async function initGsap() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ST)
      gsapModule = { gsap } as typeof import('gsap')
      ScrollTrigger = ST as unknown as import('gsap/ScrollTrigger').ScrollTrigger

      // Step detection triggers
      stepsRef.current.forEach((el, index) => {
        if (!el) return
        const trigger = (ST as unknown as { create: (opts: Record<string, unknown>) => import('gsap/ScrollTrigger').ScrollTrigger }).create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        })
        triggers.push(trigger)
      })

      // Card entrance animations
      stepsRef.current.forEach((el) => {
        if (!el) return
        const card = el.querySelector('.scrolly-card')
        if (!card) return
        gsap.from(card, {
          opacity: 0,
          y: 28,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        })
      })
    }

    initGsap()

    return () => {
      triggers.forEach((t) => {
        if (t && typeof t.kill === 'function') t.kill()
      })
    }
  }, [block.steps.length])

  return (
    <section ref={sectionRef} className="relative">
      {/* Sticky chart panel */}
      {hasChart && (
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none z-0">
          <div className="w-full max-w-[860px] px-6">
            <ChartPanel chartId={block.chartId} activeStep={activeStep} mapSteps={block.mapSteps} />
          </div>
        </div>
      )}

      {/* Step cards — scroll over the sticky chart */}
      <div className="relative z-10">
        {block.steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => {
              stepsRef.current[i] = el
            }}
            className="min-h-[90vh] flex items-center max-w-[640px] mx-auto px-8"
          >
            <div
              className="scrolly-card rounded-lg p-6 backdrop-blur-sm transition-all duration-500"
              style={{
                background: 'rgba(10, 14, 20, 0.92)',
                border: '0.5px solid var(--color-line, #1a2830)',
                opacity: i === activeStep ? 1 : 0.4,
                transform: i === activeStep ? 'translateY(0)' : 'translateY(10px)',
              }}
            >
              <div
                className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-2"
                style={{ color: 'var(--color-accent)' }}
              >
                {step.label}
              </div>
              {step.content.split('\n\n').map((para, j) => (
                <p
                  key={j}
                  className="font-[family-name:var(--font-serif)] text-[1.05rem] leading-[1.8] mb-3 last:mb-0"
                  style={{ color: 'var(--color-text)' }}
                >
                  {formatInlineMarkdown(para)}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
