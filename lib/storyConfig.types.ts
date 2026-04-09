// Pure type definitions for story configs. No runtime imports — safe for
// client components to import without dragging fs/path into the bundle.

export interface StoryDefaults {
  mapStyle: string
  mapOpacity: number
  pinColor: string
  pinRadius: number
  flySpeed: number
  /** Optional ISO 3166-1 alpha-2 country code to highlight on the map (e.g. "KR"). */
  highlightCountry?: string
  /** Override color for the country highlight. Defaults to pinColor. */
  highlightColor?: string
}

export interface MapPinConfig {
  coordinates: [number, number]
  color?: string
  label?: string
  radius?: number
  pulse?: boolean
}

export type SectionKind = 'text' | 'hero' | 'stat'

export interface SubsectionMapOverride {
  center?: [number, number]
  zoom?: number
  pitch?: number
  bearing?: number
  opacity?: number
  flySpeed?: number
  pins?: MapPinConfig[]
}

export interface StorySubsectionConfig {
  id?: string
  /** Markdown anchor reference (e.g. "Act II > The misleading spike") */
  text: string
  /**
   * Optional 0-based slice into the resolved paragraphs of `text`.
   * When set, only that paragraph(s) is shown — used to reveal bullets one
   * at a time as the chart's `activeStep` advances. Examples:
   *   paragraphs: 0       → show only the first paragraph
   *   paragraphs: [0, 2]  → show paragraphs at indices 0..2 (inclusive end? no — 0..1)
   *   omit                → show all paragraphs (legacy behaviour)
   * Use [start, end] semantics matching Array.slice (end is exclusive).
   */
  paragraphs?: number | [number, number]
  /** Optional override heading shown above the paragraphs (replaces the anchor's own heading). */
  heading?: string
  /**
   * Optional partial map override. Fields provided here replace the
   * corresponding field from the parent section's `map`. `pins` replaces
   * the entire pin array (does not merge) so you can progressively reveal
   * markers per step.
   */
  map?: SubsectionMapOverride
}

export interface StorySectionConfig {
  id?: string
  /** What kind of foreground panel to render. Defaults to 'text'. */
  kind?: SectionKind
  /**
   * Markdown anchor reference for the section's text panel.
   * Required UNLESS `subsections` is provided (in which case each subsection
   * carries its own text reference and the parent's `text` is ignored).
   */
  text?: string
  /**
   * Optional list of child subsections. When present, each subsection becomes
   * its own viewport-tall snap target. All subsections share the parent's
   * map state and chart, and their index drives the chart's activeStep
   * (so chart animations resume from where the previous subsection left off).
   */
  subsections?: StorySubsectionConfig[]
  /** Same paragraph-slice semantics as StorySubsectionConfig.paragraphs. */
  paragraphs?: number | [number, number]
  /** Optional override heading for the section's text panel. */
  heading?: string
  /** Optional foreground chart id; resolved by ChartPanel registry. */
  chart?: string
  /** Optional eyebrow line shown above the hero title (kind: hero only). */
  eyebrow?: string
  map: {
    center: [number, number]
    zoom: number
    pitch?: number
    bearing?: number
    opacity?: number
    flySpeed?: number
    pins?: MapPinConfig[]
  }
}

export interface StoryConfig {
  defaults: StoryDefaults
  sections: StorySectionConfig[]
}

/**
 * A renderable unit — one viewport-tall snap target. Sections without
 * subsections produce one unit; sections with N subsections produce N units.
 *
 * `parentIndex` indexes into the original `config.sections` array (and into
 * `mapSteps`), so multiple units with the same parentIndex share the map
 * camera position and the chart instance.
 *
 * `subIndex` is the unit's position within its parent (0 if no subsections),
 * and is what gets passed to the chart as `activeStep`.
 *
 * Pure primitives — safe to serialize from a server component into a client one.
 */
export interface ResolvedUnit {
  parentIndex: number
  subIndex: number
  parentConfig: StorySectionConfig
  heading: string | undefined
  paragraphs: string[]
}
