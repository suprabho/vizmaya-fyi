import { Theme } from '@/types/story'
import { ReactNode } from 'react'

export default function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme
  children: ReactNode
}) {
  const vars: Record<string, string> = {
    '--color-bg': theme.colors.background,
    '--color-text': theme.colors.text,
    '--color-accent': theme.colors.accent,
    '--color-accent2': theme.colors.accent2,
    '--color-teal': theme.colors.teal,
    '--color-surface': theme.colors.surface,
    '--color-muted': theme.colors.muted,
    '--font-serif': `${theme.fonts.serif}, 'Times New Roman', serif`,
    '--font-sans': `${theme.fonts.sans}, -apple-system, 'Segoe UI', Helvetica, sans-serif`,
    '--font-mono': `${theme.fonts.mono}, 'Courier New', Consolas, monospace`,
  }

  if (theme.colors.amber) vars['--color-amber'] = theme.colors.amber
  if (theme.colors.red) vars['--color-red'] = theme.colors.red

  return (
    <div
      style={{
        ...vars,
        background: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
