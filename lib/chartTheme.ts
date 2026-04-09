'use client'

import { createContext, useContext } from 'react'
import type { Theme } from '@/types/story'

/**
 * Single source of truth for chart colors. The story's frontmatter
 * `theme.colors` is the actual source — `ThemeProvider` derives a
 * `ChartColors` object from it and publishes it via context. Charts read
 * the palette via `useChartColors()` so swapping a story's theme
 * automatically reflows every chart.
 *
 * Why a hook instead of CSS variables: ECharts option objects need real
 * string values at construction time, not `var(--name)` references.
 */

export const defaultChartColors = {
  accent: '#f54900',
  accent2: '#155dfc',
  teal: '#00d5be',
  green: '#009966',
  amber: '#EF9F27',
  red: '#E24B4A',
  muted: '#aca286',
  line: '#1a2830',
  surface: '#023555',
} as const

export type ChartColors = { -readonly [K in keyof typeof defaultChartColors]: string }

const ChartColorsContext = createContext<ChartColors>({ ...defaultChartColors })

export const ChartColorsProvider = ChartColorsContext.Provider

export function useChartColors(): ChartColors {
  return useContext(ChartColorsContext)
}

/**
 * Map a story's `theme.colors` (the markdown frontmatter shape) onto the
 * chart palette. Optional fields fall back to the defaults so charts that
 * need `green`/`amber`/`red` always have something to render.
 *
 * `line` has no equivalent in the story frontmatter and stays at the
 * default — adjust here if a story ever needs a custom gridline color.
 */
export function themeToChartColors(theme: Theme): ChartColors {
  return {
    accent: theme.colors.accent,
    accent2: theme.colors.accent2,
    teal: theme.colors.teal,
    green: theme.colors.positive ?? defaultChartColors.green,
    amber: theme.colors.amber ?? defaultChartColors.amber,
    red: theme.colors.red ?? defaultChartColors.red,
    muted: theme.colors.muted,
    line: theme.colors.line ?? defaultChartColors.line,
    surface: theme.colors.surface,
  }
}
