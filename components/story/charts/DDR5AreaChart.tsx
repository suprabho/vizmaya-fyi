'use client'

import dynamic from 'next/dynamic'
import type { EChartsOption } from 'echarts'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const ACCENT = '#D85A30'
const ACCENT2 = '#534AB7'
const TEAL = '#1D9E75'
const AMBER = '#EF9F27'
const MUTED = '#3a4a50'
const LINE = '#1a2830'

// Historical DDR5 16Gb spot price data (DRAMeXchange via Tom's Hardware / Accio)
const months = [
  'Jan 25', 'Mar 25', 'Jun 25', 'Sep 25',
  'Oct 25', 'Nov 25', 'Dec 25',
  'Jan 26', 'Mar 26',
  // Projected
  'Jun 26', 'Sep 26',
]

const historical = [7.0, 6.5, 6.8, 6.84, 12.0, 24.83, 27.20, 25.0, 23.5]
const histEnd = historical.length - 1 // index 8 = Mar 26

// Three scenario extensions from Mar 26 onward
const scenario60d  = [null, null, null, null, null, null, null, null, 23.5, 19.0, 18.5]  // retreats
const scenario6mo  = [null, null, null, null, null, null, null, null, 23.5, 31.0, 33.5]  // rises
const scenario3yr  = [null, null, null, null, null, null, null, null, 23.5, 37.0, 39.5]  // structural

// Key annotation points
const annotations = [
  { x: 'Sep 25', y: 6.84, label: '$6.84\nbaseline', color: ACCENT2 },
  { x: 'Nov 25', y: 24.83, label: '$24.83', color: ACCENT },
  { x: 'Dec 25', y: 27.20, label: '$27.20\npeak', color: ACCENT },
  { x: 'Mar 26', y: 23.5, label: '$23.50\nnow', color: AMBER },
]

const TITLES: Record<number, string> = {
  0: 'The fire already burning: DDR5 16Gb rose 3.4× before Hormuz — Sep to Dec 2025',
  1: 'The AI boom ate its own supply chain — HBM crowded out standard DRAM',
  2: '60-day resolution: stockpiles hold, spot retreats to $18-20. GPU hour +2-4%.',
  3: '6-month scenario: helium contracts reprice, fabs cut utilisation. GPU hour +12-20%.',
  4: '3-5 year force majeure: structural cost reset. GPU hour +30-50%.',
}

export default function DDR5AreaChart({ activeStep }: { activeStep: number }) {
  const title = TITLES[activeStep] ?? TITLES[0]
  const showHist = activeStep >= 0
  const show60d = activeStep >= 2
  const show6mo = activeStep >= 3
  const show3yr = activeStep >= 4

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    title: {
      text: title,
      left: 'center',
      bottom: 0,
      textStyle: { color: MUTED, fontSize: 11, fontWeight: 'normal', fontFamily: 'var(--font-mono)' },
    },
    legend: {
      top: 5,
      left: 10,
      textStyle: { color: MUTED, fontSize: 10, fontFamily: 'var(--font-mono)' },
      data: [
        { name: 'Historical (verified)', itemStyle: { color: ACCENT2 } },
        ...(show60d ? [{ name: '60-day: +2-4% GPU hr', itemStyle: { color: TEAL } }] : []),
        ...(show6mo ? [{ name: '6-month: +12-20% GPU hr', itemStyle: { color: AMBER } }] : []),
        ...(show3yr ? [{ name: '3-5yr: +30-50% GPU hr', itemStyle: { color: ACCENT } }] : []),
      ],
    },
    grid: { left: 58, right: 30, top: 38, bottom: 50 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 10, interval: 0 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 45,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 10, formatter: '${value}' },
      splitLine: { lineStyle: { color: LINE } },
      name: 'DDR5 16Gb spot ($/chip)',
      nameTextStyle: { color: MUTED, fontSize: 9 },
    },
    // Shaded projection zone
    markArea: { silent: true },
    series: [
      // Historical area
      {
        name: 'Historical (verified)',
        type: 'line',
        data: showHist
          ? months.map((_, i) => (i <= histEnd ? historical[i] : null))
          : months.map(() => null),
        smooth: 0.35,
        lineStyle: { color: ACCENT2, width: 2.5 },
        symbol: 'circle',
        symbolSize: (_, { dataIndex }) => {
          const key = months[dataIndex]
          return annotations.some(a => a.x === key) ? 7 : 0
        },
        itemStyle: { color: ACCENT2 },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: ACCENT2 + '40' },
              { offset: 1, color: ACCENT2 + '05' },
            ],
          },
        },
        // Annotation labels at key points
        markPoint: {
          symbol: 'circle',
          symbolSize: 0,
          data: annotations.map(a => ({
            name: a.label,
            coord: [a.x, a.y] as [string, number],
            label: {
              show: activeStep >= 1,
              formatter: a.label,
              color: a.color,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              position: 'top' as const,
            },
          })),
        },
      },
      // 60-day scenario
      {
        name: '60-day: +2-4% GPU hr',
        type: 'line',
        data: show60d ? scenario60d : months.map(() => null),
        smooth: 0.4,
        lineStyle: { color: TEAL, width: 2, type: 'dashed' },
        symbol: 'none',
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: TEAL + '30' },
              { offset: 1, color: TEAL + '05' },
            ],
          },
        },
        endLabel: {
          show: show60d,
          formatter: '~$18-20',
          color: TEAL,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
        },
        connectNulls: false,
      },
      // 6-month scenario
      {
        name: '6-month: +12-20% GPU hr',
        type: 'line',
        data: show6mo ? scenario6mo : months.map(() => null),
        smooth: 0.4,
        lineStyle: { color: AMBER, width: 2, type: 'dashed' },
        symbol: 'none',
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: AMBER + '30' },
              { offset: 1, color: AMBER + '05' },
            ],
          },
        },
        endLabel: {
          show: show6mo,
          formatter: '~$30-35',
          color: AMBER,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
        },
        connectNulls: false,
      },
      // 3-5yr scenario
      {
        name: '3-5yr: +30-50% GPU hr',
        type: 'line',
        data: show3yr ? scenario3yr : months.map(() => null),
        smooth: 0.4,
        lineStyle: { color: ACCENT, width: 2, type: 'dashed' },
        symbol: 'none',
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: ACCENT + '30' },
              { offset: 1, color: ACCENT + '05' },
            ],
          },
        },
        endLabel: {
          show: show3yr,
          formatter: '~$35-40',
          color: ACCENT,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
        },
        connectNulls: false,
      },
    ],
    // Vertical line marking "pre-crisis floor"
    tooltip: { show: false },
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{ height: 380, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
      />
      <div
        className="text-center mt-1"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#3a4a50' }}
      >
        DDR5 16Gb (2Gx8) spot. Sources: DRAMeXchange via Tom's Hardware, TrendForce, Accio. Projections: directional estimates only.
      </div>
    </div>
  )
}
