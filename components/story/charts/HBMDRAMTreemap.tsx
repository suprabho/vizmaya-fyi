'use client'

import dynamic from 'next/dynamic'
import type { EChartsOption } from 'echarts'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const ACCENT = '#D85A30'
const ACCENT2 = '#155dfc'
const TEAL = '#00d5be'
const AMBER = '#EF9F27'
const MUTED = '#3a4a50'

// HBM global market share (Q2 2025, Counterpoint Research)
const hbmData = [
  { name: 'SK Hynix\n(Korea)', value: 62, color: ACCENT2 },
  { name: 'Samsung\n(Korea)', value: 28, color: ACCENT2 },
  { name: 'Micron\n(USA)', value: 10, color: TEAL },
]

// DRAM global market share (2026 est.)
const dramData = [
  { name: 'Samsung\n(Korea)', value: 33, color: ACCENT2 },
  { name: 'SK Hynix\n(Korea)', value: 28, color: ACCENT2 },
  { name: 'Micron\n(USA)', value: 24, color: TEAL },
  { name: 'CXMT\n(China)', value: 8, color: ACCENT },
  { name: 'Others', value: 7, color: MUTED },
]

const TITLES: Record<number, string> = {
  0: 'Global HBM market: South Korea holds 90% — every AI GPU depends on it',
  1: 'Global DRAM market: Korea dominates; Micron is the only non-Korean alternative',
  2: 'Combined: Korea produces the memory the world cannot build AI without',
}

export default function HBMDRAMTreemap({ activeStep }: { activeStep: number }) {
  const title = TITLES[activeStep] ?? TITLES[0]
  const isHBM = activeStep <= 0
  const data = isHBM ? hbmData : dramData
  const subtitle = isHBM ? 'HBM (High Bandwidth Memory) — 2026' : 'DRAM Global Market Share — 2026'

  const treemapData = data.map(d => ({
    name: d.name,
    value: d.value,
    itemStyle: { color: d.color, opacity: d.color === MUTED ? 0.35 : d.color === ACCENT ? 0.85 : 0.7 },
    label: {
      show: true,
      formatter: `{name|${d.name}}\n{pct|${d.value}%}`,
      rich: {
        name: {
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          lineHeight: 16,
        },
        pct: {
          color: d.color === MUTED ? '#8a9a9f' : '#fff',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 20,
        },
      },
    },
  }))

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 700,
    animationEasing: 'cubicOut',
    title: [
      {
        text: subtitle,
        left: 'center',
        top: 4,
        textStyle: { color: MUTED, fontSize: 10, fontWeight: 'normal', fontFamily: 'var(--font-mono)' },
      },
      {
        text: title,
        left: 'center',
        bottom: 0,
        textStyle: { color: MUTED, fontSize: 11, fontWeight: 'normal', fontFamily: 'var(--font-mono)' },
      },
    ],
    series: [
      {
        type: 'treemap',
        top: 28,
        bottom: 30,
        left: 4,
        right: 4,
        data: treemapData,
        breadcrumb: { show: false },
        roam: false,
        nodeClick: false,
        emphasis: { disabled: true },
        levels: [
          {
            itemStyle: { borderWidth: 2, borderColor: '#0a0e14', gapWidth: 3 },
          },
        ],
        label: {
          position: 'inside',
          align: 'center',
          verticalAlign: 'middle',
        },
      },
    ],
    tooltip: {
      show: true,
      backgroundColor: '#111820',
      borderColor: '#1a2830',
      textStyle: { color: '#e0ddd5', fontFamily: 'var(--font-mono)', fontSize: 11 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) =>
        `${String(params.name).replace(/\n/g, ' ')}: <strong>${params.value}%</strong>`,
    },
  }

  return (
    <div className="w-full">
      <ReactECharts
        key={`${activeStep}`}
        option={option}
        style={{ height: 360, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
      />
      <div
        className="text-center mt-1"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#3a4a50' }}
      >
        Sources: Counterpoint Research (HBM Q2 2025), TrendForce, IDC. DRAM shares are 2026 estimates.
      </div>
    </div>
  )
}
