export interface Theme {
  colors: {
    background: string
    text: string
    accent: string
    accent2: string
    teal: string
    surface: string
    muted: string
    amber?: string
    red?: string
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
