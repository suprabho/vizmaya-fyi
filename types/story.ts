export interface Theme {
  colors: {
    background: string
    text: string
    accent: string
    accent2: string
    teal: string
    surface: string
    muted: string
    positive?: string
    amber?: string
    red?: string
    line?: string
  }
  fonts: {
    serif: string
    sans: string
    mono: string
  }
}

export interface Frontmatter {
  title: string
  subtitle: string
  byline: string
  date: string
  theme: Theme
}

export type BlockType =
  | 'hero'
  | 'stat-block'
  | 'act-header'
  | 'divider'
  | 'prose'
  | 'subsection-header'
  | 'data-table'
  | 'exposure-grid'
  | 'scrolly-section'
  | 'scenario-toggle'
  | 'takeaway-grid'
  | 'methodology'
  | 'footer'
  | 'unknown'

export interface HeroBlock {
  type: 'hero'
  title: string
  dek: string
  byline: string
}

export interface StatBlock {
  type: 'stat-block'
  value: string
  description: string
}

export interface ActHeaderBlock {
  type: 'act-header'
  actNumber: string
  title: string
}

export interface DividerBlock {
  type: 'divider'
}

export interface ProseBlock {
  type: 'prose'
  paragraphs: string[]
}

export interface SubsectionHeaderBlock {
  type: 'subsection-header'
  title: string
}

export interface TableRow {
  cells: string[]
}

export interface DataTableBlock {
  type: 'data-table'
  headers: string[]
  rows: string[][]
  scenarioLabel?: string
}

export interface ExposureItem {
  label: string
  value: string
  description: string
  color?: string
}

export interface ExposureGridBlock {
  type: 'exposure-grid'
  items: ExposureItem[]
}

export interface ScrollStep {
  label: string
  content: string
}

export interface MapPin {
  coordinates: [number, number]
  color?: string
  label?: string
  radius?: number
  pulse?: boolean
  /** Preferred popup anchor direction. Controls which side of the pin the label appears on. */
  labelAnchor?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * A single region in a choropleth. Either supply an explicit `color`, or a
 * `value` that gets mapped through the layer's `ramp` to a color.
 */
export interface MapRegion {
  /** ISO 3166-1 alpha-2 (level: country) or the feature id (level: custom). */
  code: string
  /** Explicit fill color. Overrides the ramp. */
  color?: string
  /** Fill opacity (0..1). Defaults to 0.55. */
  opacity?: number
  /** Numeric value used to drive the ramp when `color` is omitted. */
  value?: number
  /** Optional label (used by future hover logic; safe to omit). */
  label?: string
}

export type MapRegionLevel = 'country' | 'custom'

export interface MapRegionLayer {
  /**
   * `country` uses Mapbox's built-in country-boundaries-v1 tileset.
   * `custom` requires `geojsonUrl` and `idProperty`.
   */
  level: MapRegionLevel
  /** For level: custom — URL or absolute path served by /public. */
  geojsonUrl?: string
  /** For level: custom — feature property whose value matches items[].code. */
  idProperty?: string
  items: MapRegion[]
  /**
   * Color stops for the value→color ramp. Two or more hex strings (or theme
   * tokens like "$accent"). Items with `value` but no explicit `color` get
   * interpolated between adjacent stops.
   */
  colors?: string[]
  /**
   * Domain values matching `colors` (same length). If omitted, the domain
   * is auto-computed from items[].value as [min, max] evenly-spaced across
   * the color stops.
   */
  ramp?: number[]
  /** Border color. Defaults to the last color in `colors` (or accent). */
  lineColor?: string
  /** Border width in pixels. Defaults to 0.6. */
  lineWidth?: number
}

export interface HeatmapPoint {
  coordinates: [number, number]
  /** Relative intensity (defaults to 1). */
  weight?: number
}

export interface HeatmapLayer {
  points: HeatmapPoint[]
  /** Radius in pixels at zoom 9. Defaults to 30. */
  radius?: number
  /** Explicit max weight for normalization. Auto-computed otherwise. */
  maxIntensity?: number
  /**
   * Color stops applied across weight 0..1. Five hex strings recommended;
   * first is transparent/low, last is the hot point color.
   */
  ramp?: string[]
  /** Layer opacity (0..1). Defaults to 0.75. */
  opacity?: number
}

export interface MapStep {
  center: [number, number]
  zoom: number
  pitch?: number
  bearing?: number
  flySpeed?: number
  opacity?: number
  pins?: MapPin[]
  /** Optional choropleth layer for this step. */
  regions?: MapRegionLayer
  /** Optional heatmap layer for this step. */
  heatmap?: HeatmapLayer
}

export interface ScrollySectionBlock {
  type: 'scrolly-section'
  steps: ScrollStep[]
  chartId?: string
}

export interface ScenarioToggleBlock {
  type: 'scenario-toggle'
  scenarios: {
    label: string
    table: DataTableBlock
  }[]
}

export interface TakeawayItem {
  audience: string
  content: string
}

export interface TakeawayGridBlock {
  type: 'takeaway-grid'
  items: TakeawayItem[]
}

export interface MethodologyBlock {
  type: 'methodology'
  content: string[]
}

export interface FooterBlock {
  type: 'footer'
  text: string
}

export interface UnknownBlock {
  type: 'unknown'
  content: string
}

export type Block =
  | HeroBlock
  | StatBlock
  | ActHeaderBlock
  | DividerBlock
  | ProseBlock
  | SubsectionHeaderBlock
  | DataTableBlock
  | ExposureGridBlock
  | ScrollySectionBlock
  | ScenarioToggleBlock
  | TakeawayGridBlock
  | MethodologyBlock
  | FooterBlock
  | UnknownBlock
