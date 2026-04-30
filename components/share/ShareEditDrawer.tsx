'use client'

import type { ShareSectionOverride, ResolvedUnit } from '@/lib/storyConfig.types'
import type { CardVariant } from './ShareCard'

export interface SelectedCard {
  index: number
  unit: ResolvedUnit
  variant: CardVariant
}

interface Props {
  selected: SelectedCard | null
  overrides: Record<string, ShareSectionOverride>
  onChange: (next: Record<string, ShareSectionOverride>) => void
  onClose: () => void
}

/**
 * Side drawer for editing share overrides on a single card. Targets the
 * section-level override when the card's section has no subsections, else
 * targets the per-subsection override at the card's `subIndex`.
 */
export default function ShareEditDrawer({ selected, overrides, onChange, onClose }: Props) {
  if (!selected) return null
  const { unit, variant } = selected
  const sectionId = unit.parentConfig.id
  if (!sectionId) {
    return (
      <DrawerFrame onClose={onClose} title="Edit card">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          This section has no <code>id</code> in the config — share overrides can&apos;t target it.
          Add an <code>id</code> in the story config to enable editing.
        </p>
      </DrawerFrame>
    )
  }

  const hasSubsections = !!unit.parentConfig.subsections?.length
  const useSubsection = hasSubsections
  const section: ShareSectionOverride = overrides[sectionId] ?? {}
  const sub = useSubsection ? section.subsections?.[unit.subIndex] ?? {} : null

  // Variant-aware field visibility. Chart cards render via their own `chart`
  // slot in the override (so they don't collide with map-title or content
  // cards that share the same scope).
  const kind = unit.parentConfig.kind ?? 'text'
  const isChart = variant === 'graph'
  const isMapTitle = variant === 'map-title'
  const showHeading = true
  const showSubheading = true
  // Layers only matter on cards that render a map: map-title, and hero
  // content cards (which paint their own map background).
  const showLayers = isMapTitle || (variant === 'auto' && kind === 'hero')

  const heading = isChart
    ? (useSubsection ? sub?.chart?.heading : section.chart?.heading) ?? ''
    : (useSubsection ? sub?.heading : section.heading) ?? ''
  const subheading = isChart
    ? (useSubsection ? sub?.chart?.subheading : section.chart?.subheading) ?? ''
    : (useSubsection ? sub?.subheading : section.subheading) ?? ''
  const layers = (useSubsection ? sub?.layers : section.layers) ?? {}
  const hide = section.hide ?? false

  const writeSection = (patch: Partial<ShareSectionOverride>) => {
    const nextSection: ShareSectionOverride = { ...section, ...patch }
    pruneEmpty(nextSection as unknown as Record<string, unknown>)
    const next = { ...overrides }
    if (isSectionEmpty(nextSection)) delete next[sectionId]
    else next[sectionId] = nextSection
    onChange(next)
  }

  const writeSub = (patch: Record<string, unknown>) => {
    const nextSub = { ...(sub ?? {}), ...patch }
    pruneEmpty(nextSub as Record<string, unknown>)
    const nextSubsections = { ...(section.subsections ?? {}) }
    if (Object.keys(nextSub).length === 0) delete nextSubsections[unit.subIndex]
    else nextSubsections[unit.subIndex] = nextSub
    const nextSection: ShareSectionOverride = { ...section }
    if (Object.keys(nextSubsections).length === 0) delete nextSection.subsections
    else nextSection.subsections = nextSubsections
    writeSection({ subsections: nextSection.subsections })
  }

  const setLayer = (key: 'pins' | 'regions' | 'heatmap', value: boolean | undefined) => {
    const nextLayers = { ...layers }
    if (value === undefined) delete nextLayers[key]
    else nextLayers[key] = value
    if (useSubsection) writeSub({ layers: nextLayers })
    else writeSection({ layers: nextLayers })
  }

  // Write a heading/subheading patch to either the top-level card scope or
  // the per-card slot (currently only `chart`). Keeping this logic in one
  // place so we can grow per-variant slots later (e.g. mapTitle, content).
  const writeText = (field: 'heading' | 'subheading', value: string | undefined) => {
    if (isChart) {
      if (useSubsection) {
        const nextChart = { ...(sub?.chart ?? {}), [field]: value }
        if (!nextChart.heading && !nextChart.subheading) {
          writeSub({ chart: undefined })
        } else {
          writeSub({ chart: nextChart })
        }
      } else {
        const nextChart = { ...(section.chart ?? {}), [field]: value }
        if (!nextChart.heading && !nextChart.subheading) {
          writeSection({ chart: undefined })
        } else {
          writeSection({ chart: nextChart })
        }
      }
      return
    }
    if (useSubsection) writeSub({ [field]: value })
    else writeSection({ [field]: value })
  }

  return (
    <DrawerFrame onClose={onClose} title={`Edit ${isMapTitle ? 'title card' : isChart ? 'chart card' : 'card'}`}>
      <div className="space-y-5">
        {showHeading && (
          <div>
            <Label>Heading</Label>
            <input
              type="text"
              value={heading}
              placeholder={isChart ? '—' : unit.heading ?? '—'}
              onChange={(e) => writeText('heading', e.target.value || undefined)}
              className="w-full rounded-md px-3 py-2 text-sm"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border, transparent)',
              }}
            />
          </div>
        )}

        {showSubheading && (
          <div>
            <Label>Subheading</Label>
            <input
              type="text"
              value={subheading}
              placeholder={isChart ? '—' : unit.subheading ?? '—'}
              onChange={(e) => writeText('subheading', e.target.value || undefined)}
              className="w-full rounded-md px-3 py-2 text-sm"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border, transparent)',
              }}
            />
          </div>
        )}

        {showLayers && (
          <div>
            <Label>Map layers</Label>
            <p className="text-[0.7rem] mb-2" style={{ color: 'var(--color-muted)' }}>
              Inherit = use parent settings. Off = hide on this card.
            </p>
            <div className="space-y-2">
              <LayerRow name="Pins" value={layers.pins} onChange={(v) => setLayer('pins', v)} />
              <LayerRow name="Regions" value={layers.regions} onChange={(v) => setLayer('regions', v)} />
              <LayerRow name="Heatmap" value={layers.heatmap} onChange={(v) => setLayer('heatmap', v)} />
            </div>
          </div>
        )}

        <div>
          <Label>Section visibility</Label>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={hide}
              onChange={(e) => writeSection({ hide: e.target.checked || undefined })}
            />
            Hide this entire section from share mode
          </label>
        </div>
      </div>
    </DrawerFrame>
  )
}

function DrawerFrame({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      className="fixed top-0 right-0 h-full w-[360px] z-40 border-l overflow-y-auto"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-surface)',
      }}
    >
      <div
        className="sticky top-0 px-5 py-3 border-b flex items-center justify-between"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-sm opacity-60 hover:opacity-100"
          style={{ color: 'var(--color-text)' }}
          aria-label="Close drawer"
        >
          ✕
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-1"
      style={{ color: 'var(--color-accent)' }}
    >
      {children}
    </div>
  )
}

function LayerRow({
  name,
  value,
  onChange,
}: {
  name: string
  value: boolean | undefined
  onChange: (v: boolean | undefined) => void
}) {
  const state: 'inherit' | 'on' | 'off' = value === undefined ? 'inherit' : value ? 'on' : 'off'
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--color-text)' }}>{name}</span>
      <div className="flex gap-1">
        {(['inherit', 'on', 'off'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt === 'inherit' ? undefined : opt === 'on')}
            className="px-2 py-1 rounded text-[0.7rem] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-opacity"
            style={{
              background: state === opt ? 'var(--color-accent)' : 'var(--color-surface)',
              color: state === opt ? 'var(--color-bg)' : 'var(--color-text)',
              opacity: state === opt ? 1 : 0.7,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function isSectionEmpty(s: ShareSectionOverride): boolean {
  return (
    s.heading == null &&
    s.subheading == null &&
    s.hide == null &&
    s.layers == null &&
    s.shareParagraphs == null &&
    s.paragraphsOverride == null &&
    s.subsections == null &&
    s.map == null
  )
}

function pruneEmpty(obj: Record<string, unknown>) {
  for (const key of Object.keys(obj)) {
    const v = obj[key]
    if (v == null) {
      delete obj[key]
      continue
    }
    if (typeof v === 'object' && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>
      pruneEmpty(inner)
      if (Object.keys(inner).length === 0) delete obj[key]
    }
  }
}
