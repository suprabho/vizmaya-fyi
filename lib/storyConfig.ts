import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import type {
  StoryConfig,
  StoryDefaults,
  StorySectionConfig,
} from './storyConfig.types'

export type {
  StoryConfig,
  StoryDefaults,
  StorySectionConfig,
  StorySubsectionConfig,
  MapPinConfig,
  ResolvedUnit,
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
    if (hasSubs) {
      s.subsections!.forEach((sub, j) => {
        if (!sub || typeof sub !== 'object' || typeof sub.text !== 'string' || sub.text.trim().length === 0) {
          throw new Error(
            `Section ${i} subsection ${j} in ${slug}.config.yaml is missing 'text'`
          )
        }
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
