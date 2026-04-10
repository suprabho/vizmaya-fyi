import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import type {
  StoryConfig,
  StoryDefaults,
  StorySectionConfig,
  ShareConfig,
} from './storyConfig.types'

export type {
  StoryConfig,
  StoryDefaults,
  StorySectionConfig,
  StorySubsectionConfig,
  MapPinConfig,
  MapOverrides,
  ResolvedUnit,
  ShareConfig,
  ShareSectionOverride,
} from './storyConfig.types'

const STORIES_DIR = path.join(process.cwd(), 'content/stories')

const DEFAULTS: StoryDefaults = {
  mapStyle: 'mapbox://styles/mapbox/dark-v11',
  mapOpacity: 0.6,
  pinColor: '#D85A30',
  pinRadius: 12,
  flySpeed: 1.2,
}

/**
 * Returns true if a sibling .config.yaml exists for the given slug.
 */
export function hasStoryConfig(slug: string): boolean {
  return fs.existsSync(path.join(STORIES_DIR, `${slug}.config.yaml`))
}

/**
 * Load and validate the YAML config for a story slug.
 * Throws if the file is missing, malformed, or missing required fields.
 */
export function loadStoryConfig(slug: string): StoryConfig {
  const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.config.yaml`), 'utf8')
  const raw = parseYaml(file) as Partial<StoryConfig> | null

  if (!raw || typeof raw !== 'object') {
    throw new Error(`Story config ${slug}.config.yaml is empty or invalid YAML`)
  }
  if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
    throw new Error(`Story config ${slug}.config.yaml has no sections`)
  }

  // `paragraphs` may be `N` (number — single index) or `[start, end]` (slice).
  // Caught here so a typo in YAML produces a clear error rather than a silent
  // empty render later.
  const validateParagraphSpec = (label: string, p: unknown): void => {
    if (p === undefined) return
    if (typeof p === 'number') {
      if (!Number.isInteger(p) || p < 0) {
        throw new Error(`${label}: 'paragraphs' must be a non-negative integer or [start, end]`)
      }
      return
    }
    if (Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 0)) {
      return
    }
    throw new Error(`${label}: 'paragraphs' must be a non-negative integer or [start, end]`)
  }

  const validateParagraphs = (label: string, p: unknown): void => {
    validateParagraphSpec(label, p)
  }

  const validateMobileParagraphs = (label: string, mp: unknown): void => {
    if (mp === undefined) return
    if (!Array.isArray(mp) || mp.length === 0) {
      throw new Error(`${label}: 'mobileParagraphs' must be a non-empty array of paragraph specs`)
    }
    mp.forEach((spec, k) => {
      validateParagraphSpec(`${label} mobileParagraphs[${k}]`, spec)
    })
  }

  const validateShareParagraphs = (label: string, sp: unknown): void => {
    if (sp === undefined) return
    if (!Array.isArray(sp) || sp.length === 0) {
      throw new Error(`${label}: 'shareParagraphs' must be a non-empty array of paragraph specs`)
    }
    sp.forEach((spec, k) => {
      validateParagraphSpec(`${label} shareParagraphs[${k}]`, spec)
    })
  }

  raw.sections.forEach((s, i) => {
    if (!s || typeof s !== 'object') {
      throw new Error(`Section ${i} in ${slug}.config.yaml is not an object`)
    }
    const hasText = typeof s.text === 'string' && s.text.trim().length > 0
    const hasSubs = Array.isArray(s.subsections) && s.subsections.length > 0
    if (!hasText && !hasSubs) {
      throw new Error(
        `Section ${i} in ${slug}.config.yaml needs either 'text' or a non-empty 'subsections' array`
      )
    }
    validateParagraphs(`Section ${i} in ${slug}.config.yaml`, s.paragraphs)
    validateMobileParagraphs(`Section ${i} in ${slug}.config.yaml`, s.mobileParagraphs)
    validateShareParagraphs(`Section ${i} in ${slug}.config.yaml`, s.shareParagraphs)
    if (hasSubs) {
      s.subsections!.forEach((sub, j) => {
        if (!sub || typeof sub !== 'object' || typeof sub.text !== 'string' || sub.text.trim().length === 0) {
          throw new Error(
            `Section ${i} subsection ${j} in ${slug}.config.yaml is missing 'text'`
          )
        }
        validateParagraphs(
          `Section ${i} subsection ${j} in ${slug}.config.yaml`,
          sub.paragraphs
        )
        validateMobileParagraphs(
          `Section ${i} subsection ${j} in ${slug}.config.yaml`,
          sub.mobileParagraphs
        )
        validateShareParagraphs(
          `Section ${i} subsection ${j} in ${slug}.config.yaml`,
          sub.shareParagraphs
        )
      })
    }
    if (!s.map || !Array.isArray(s.map.center) || s.map.center.length !== 2) {
      throw new Error(`Section ${i} in ${slug}.config.yaml is missing 'map.center'`)
    }
    if (typeof s.map.zoom !== 'number') {
      throw new Error(`Section ${i} in ${slug}.config.yaml is missing 'map.zoom'`)
    }
  })

  return {
    defaults: { ...DEFAULTS, ...(raw.defaults ?? {}) },
    sections: raw.sections as StorySectionConfig[],
  }
}

/**
 * Returns true if a sibling .share.yaml exists for the given slug.
 */
export function hasShareConfig(slug: string): boolean {
  return fs.existsSync(path.join(STORIES_DIR, `${slug}.share.yaml`))
}

/**
 * Load the share-mode YAML config for a story slug.
 * Returns null if no share config exists.
 */
export function loadShareConfig(slug: string): ShareConfig | null {
  const filePath = path.join(STORIES_DIR, `${slug}.share.yaml`)
  if (!fs.existsSync(filePath)) return null
  const file = fs.readFileSync(filePath, 'utf8')
  const raw = parseYaml(file) as Partial<ShareConfig> | null
  if (!raw || typeof raw !== 'object') return null
  return {
    sections: raw.sections ?? {},
  }
}
