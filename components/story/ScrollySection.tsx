'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { ScrollySectionBlock } from '@/types/story'
import KoreaBarChart from './charts/KoreaBarChart'
import HeliumPriceChart from './charts/HeliumPriceChart'
import FeedbackLoopDiagram from './charts/FeedbackLoopDiagram'
import DRAMPriceChart from './charts/DRAMPriceChart'

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

function ChartPanel({ chartId, activeStep }: { chartId?: string; activeStep: number }) {
  switch (chartId) {
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

export default function ScrollySection({ block }: { block: ScrollySectionBlock }) {
  const [activeStep, setActiveStep] = useState(0)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])
  const hasChart = !!block.chartId

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    stepsRef.current.forEach((el, index) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index)
          }
        },
        { rootMargin: '-40% 0px -40% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [block.steps.length])

  return (
    <section className="relative">
      {/* Sticky chart panel */}
      {hasChart && (
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none z-0">
          <div className="w-full max-w-[860px] px-6">
            <ChartPanel chartId={block.chartId} activeStep={activeStep} />
          </div>
        </div>
      )}

      {/* Step cards */}
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
              className="rounded-lg p-6 backdrop-blur-sm transition-all duration-500"
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
