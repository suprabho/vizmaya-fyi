'use client'

import dynamic from 'next/dynamic'
import type { EChartsOption } from 'echarts'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const ACCENT = '#D85A30'
const TEAL = '#1D9E75'
const MUTED = '#3a4a50'
const LINE = '#1a2830'

const months = ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26*', 'May 26*', 'Jun 26*']
const contractPrices = [570, 560, 550, 540, 530, 520, 520, 520, 600, 750]
const spotPrices = [620, 600, 580, 560, 550, 540, 900, 1100, 1400, 1800]

const TITLES: Record<number, string> = {
  0: 'March 2026: Spot spikes. Contracts untouched. Headlines mislead.',
  1: 'Month 4-6: Contract repricing begins. The 98% starts moving.',
  2: 'Stockpile runway: Samsung ~6 months, TSMC 2+ months, recycling 60-75%',
}

export default function HeliumPriceChart({ activeStep }: { activeStep: number }) {
  const title = TITLES[activeStep] ?? TITLES[0]
  const showProjected = activeStep >= 1
  const sliceEnd = showProjected ? 10 : 7

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
    grid: { left: 65, right: 30, top: 35, bottom: 50 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 2000,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 10, formatter: '${value}' },
      splitLine: { lineStyle: { color: LINE } },
    },
    series: [
      {
        name: 'Spot (2% of market)',
        type: 'line',
        data: spotPrices.slice(0, sliceEnd).map((v, i) => (i < sliceEnd ? v : null)),
        smooth: 0.3,
        lineStyle: { color: ACCENT, width: 2.5, type: 'dashed' },
        symbol: 'none',
        endLabel: {
          show: true,
          color: ACCENT,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          formatter: () => showProjected ? '$1,800+' : '$900+',
        },
      },
      {
        name: 'Contract (98%)',
        type: 'line',
        data: contractPrices.slice(0, sliceEnd).map((v, i) => (i < sliceEnd ? v : null)),
        smooth: 0.3,
        lineStyle: { color: TEAL, width: 2.5 },
        symbol: 'none',
        endLabel: {
          show: true,
          color: TEAL,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          formatter: () => showProjected ? '$750 — rising' : '$520 — unmoved',
        },
      },
      // Projected zone highlight
      ...(showProjected
        ? [
            {
              type: 'line' as const,
              markArea: {
                silent: true,
                itemStyle: { color: 'rgba(216, 90, 48, 0.06)' },
                data: [[{ xAxis: 'Apr 26*' }, { xAxis: 'Jun 26*' }]],
              },
              data: [] as number[],
            },
          ]
        : []),
    ],
    legend: {
      top: 5,
      left: 10,
      textStyle: { color: MUTED, fontSize: 10, fontFamily: 'var(--font-mono)' },
      data: [
        { name: 'Spot (2% of market)', itemStyle: { color: ACCENT } },
        { name: 'Contract (98%)', itemStyle: { color: TEAL } },
      ],
    },
    tooltip: { show: false },
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{ height: 340, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
      />
      <div
        className="text-center mt-1"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#3a4a50' }}
      >
        Sources: IMARC, ChemAnalyst, Phil Kornbluth (CNBC). *Projected if crisis extends.
      </div>
    </div>
  )
}
