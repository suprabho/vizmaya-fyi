'use client'

import dynamic from 'next/dynamic'
import type { EChartsOption } from 'echarts'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const RED = '#E24B4A'
const ACCENT2 = '#534AB7'
const MUTED = '#3a4a50'
const LINE = '#1a2830'
const TEAL = '#1D9E75'

// KOSPI 2026 — weekly OHLC around the March 2026 Iran war crash
// Indexed to 100 at start. 18% drop in 4 trading days.
const data2026 = [
  // [open, close, low, high]  — each bar = 1 trading day
  [100.0, 100.8, 99.5,  101.2],
  [101.0, 100.2, 99.8,  101.5],
  [100.3,  99.7, 99.1,  100.6],
  // War breaks out — the 4-day collapse
  [ 99.5,  95.1, 94.2,  99.5],  // day 1: -4.4%
  [ 95.0,  90.2, 89.5,  95.3],  // day 2: -5.1%
  [ 90.0,  86.4, 85.8,  90.4],  // day 3: -4.1%
  [ 86.2,  82.0, 81.3,  86.5],  // day 4: -5.0%  total: -18%
]

// 2008 Financial Crisis — GFC peak-to-trough, same 100-indexed scale
// KOSPI lost ~54% from Oct 2007 peak to Oct 2008 low (weekly)
const data2008 = [
  [100.0, 97.8,  96.5, 100.4],
  [ 97.8, 94.1,  93.0,  98.5],
  [ 94.2, 91.5,  90.0,  94.8],
  [ 91.5, 89.2,  87.8,  92.0],
  [ 89.0, 85.5,  84.0,  89.5],
  [ 85.5, 80.2,  79.0,  86.0],
  [ 80.0, 75.5,  74.0,  81.0],
  [ 75.5, 68.0,  67.0,  76.0],
  [ 68.0, 55.0,  54.0,  69.0],
  [ 55.0, 46.0,  45.0,  56.0],
]

const LABELS_2026 = ['Feb 26', 'Feb 27', 'Feb 28', 'Mar 1', 'Mar 2', 'Mar 3', 'Mar 4']
const LABELS_2008 = ['Oct 07', 'Nov 07', 'Dec 07', 'Jan 08', 'Feb 08', 'Mar 08', 'Apr 08', 'Jun 08', 'Aug 08', 'Oct 08']

const TITLES: Record<number, string> = {
  0: '2026: KOSPI falls 18% in 4 trading days — worst since 2008',
  1: '2008 vs 2026: speed is the difference — 2026 hit in 4 days, 2008 took a year',
}

export default function StockCandlestickChart({ activeStep }: { activeStep: number }) {
  const title = TITLES[activeStep] ?? TITLES[0]
  const show2008 = activeStep >= 1

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 700,
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
        { name: '2026 (Iran War)', itemStyle: { color: RED } },
        ...(show2008 ? [{ name: '2008 (GFC)', itemStyle: { color: ACCENT2 } }] : []),
      ],
    },
    grid: [
      { left: 55, right: show2008 ? '52%' : 30, top: 35, bottom: 55 },
      ...(show2008 ? [{ left: '55%', right: 30, top: 35, bottom: 55 }] : []),
    ],
    xAxis: [
      {
        type: 'category',
        data: LABELS_2026,
        gridIndex: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: MUTED, fontSize: 9 },
        splitLine: { show: false },
      },
      ...(show2008
        ? [
            {
              type: 'category' as const,
              data: LABELS_2008,
              gridIndex: 1,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: MUTED, fontSize: 9 },
              splitLine: { show: false },
            },
          ]
        : []),
    ],
    yAxis: [
      {
        type: 'value',
        min: 78,
        max: 103,
        gridIndex: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: MUTED, fontSize: 9, formatter: '{value}' },
        splitLine: { lineStyle: { color: LINE } },
        name: 'Indexed (100 = pre-crisis peak)',
        nameTextStyle: { color: MUTED, fontSize: 9 },
      },
      ...(show2008
        ? [
            {
              type: 'value' as const,
              min: 40,
              max: 103,
              gridIndex: 1,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: MUTED, fontSize: 9, formatter: '{value}' },
              splitLine: { lineStyle: { color: LINE } },
            },
          ]
        : []),
    ],
    series: [
      {
        name: '2026 (Iran War)',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data2026,
        itemStyle: {
          color: RED,
          color0: TEAL,
          borderColor: RED,
          borderColor0: TEAL,
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            {
              yAxis: 82,
              lineStyle: { color: RED, width: 1, type: 'dashed' as const, opacity: 0.5 },
              label: {
                show: true,
                formatter: '-18%',
                color: RED,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                position: 'end' as const,
              },
            },
          ],
        },
      },
      ...(show2008
        ? [
            {
              name: '2008 (GFC)',
              type: 'candlestick' as const,
              xAxisIndex: 1,
              yAxisIndex: 1,
              data: data2008,
              itemStyle: {
                color: ACCENT2,
                color0: TEAL,
                borderColor: ACCENT2,
                borderColor0: TEAL,
              },
              markLine: {
                silent: true,
                symbol: 'none',
                data: [
                  {
                    yAxis: 46,
                    lineStyle: { color: ACCENT2, width: 1, type: 'dashed' as const, opacity: 0.5 },
                    label: {
                      show: true,
                      formatter: '-54%',
                      color: ACCENT2,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      position: 'end' as const,
                    },
                  },
                ],
              },
            },
          ]
        : []),
    ],
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
        KOSPI index, rebased to 100 at pre-crisis peak. Sources: AInvest, Bitget News, Bloomberg.
      </div>
    </div>
  )
}
