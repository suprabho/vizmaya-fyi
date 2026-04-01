'use client'

import { useState, useRef } from 'react'
import { useInView } from '@/lib/use-in-view'
import { ScenarioToggleBlock } from '@/types/story'

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '')
}

const TEAL = '#1D9E75'
const AMBER = '#EF9F27'
const ACCENT = '#D85A30'

const SCENARIO_COLORS = [TEAL, AMBER, ACCENT]

// Exact data from reference HTML
const COST_LAYERS = [
  [
    { name: 'Helium', pct: 3, desc: '+40-50% spot', color: TEAL },
    { name: 'Korean energy', pct: 8, desc: '+40-60% spot', color: TEAL },
    { name: 'Petrochemicals', pct: 5, desc: '+10-15%', color: TEAL },
    { name: 'Korean fabs', pct: 2, desc: 'Stockpiles hold', color: TEAL },
    { name: 'GPU module', pct: 1, desc: '+0-2%', color: TEAL },
    { name: 'Cloud GPU hour', pct: 3, desc: '+2-4%', color: TEAL },
  ],
  [
    { name: 'Helium', pct: 35, desc: '+100-200%', color: AMBER },
    { name: 'Korean energy', pct: 28, desc: '+25-35%', color: AMBER },
    { name: 'Petrochemicals', pct: 18, desc: '+20-30%', color: AMBER },
    { name: 'Korean fabs', pct: 55, desc: '-10-30% util.', color: AMBER },
    { name: 'GPU module', pct: 40, desc: '+8-15%', color: AMBER },
    { name: 'Cloud GPU hour', pct: 48, desc: '+12-20%', color: AMBER },
  ],
  [
    { name: 'Helium', pct: 80, desc: 'New floor', color: ACCENT },
    { name: 'Korean energy', pct: 45, desc: '+15-20%', color: ACCENT },
    { name: 'Petrochemicals', pct: 30, desc: '+10-15%', color: ACCENT },
    { name: 'Korean fabs', pct: 70, desc: 'Cost edge lost', color: ACCENT },
    { name: 'GPU module', pct: 58, desc: '+15-25%', color: ACCENT },
    { name: 'Cloud GPU hour', pct: 75, desc: '+30-50%', color: ACCENT },
  ],
]

const TOTAL_LABELS = ['+2-4%', '+12-20%', '+30-50%']

export default function ScenarioToggle({ block }: { block: ScenarioToggleBlock }) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })
  const color = SCENARIO_COLORS[active]
  const layers = COST_LAYERS[active]

  const labels = block.scenarios.map((s) => s.label)

  return (
    <section ref={ref} className="py-8">
      {/* Toggle buttons */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {labels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="px-5 py-2 rounded-full font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] transition-all duration-300 cursor-pointer"
            style={{
              border: `1px solid ${active === i ? SCENARIO_COLORS[i] : 'var(--color-line, #1a2830)'}`,
              color: active === i ? SCENARIO_COLORS[i] : 'var(--color-muted)',
              background: active === i ? `${SCENARIO_COLORS[i]}15` : 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cost layer rows */}
      <div
        className="max-w-[860px] mx-auto px-8 transition-opacity duration-500"
        style={{ opacity: isInView ? 1 : 0 }}
      >
        {layers.map((layer, i) => (
          <div
            key={`${active}-${i}`}
            className="grid gap-4 py-4 items-center"
            style={{
              gridTemplateColumns: '140px 1fr 100px',
              borderBottom: '0.5px solid var(--color-line, #1a2830)',
            }}
          >
            <div
              className="font-[family-name:var(--font-sans)] text-[0.9rem]"
              style={{ color: 'var(--color-text)' }}
            >
              {layer.name}
            </div>
            <div
              className="h-1.5 rounded-full"
              style={{ background: 'var(--color-line, #1a2830)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: layer.color,
                  width: isInView ? `${layer.pct}%` : '0%',
                  transition: 'width 1s ease',
                }}
              />
            </div>
            <div
              className="font-[family-name:var(--font-mono)] text-[0.85rem] text-right font-bold"
              style={{ color: layer.color }}
            >
              {layer.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Total impact */}
      <div className="text-center mt-6 mb-12">
        <div
          className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-muted)' }}
        >
          End-to-end GPU hour impact
        </div>
        <div
          className="font-[family-name:var(--font-serif)] text-[2.5rem] font-bold mt-1 transition-all duration-500"
          style={{ color }}
        >
          {TOTAL_LABELS[active]}
        </div>
      </div>
    </section>
  )
}
