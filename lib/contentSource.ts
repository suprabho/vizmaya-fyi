/**
 * Content source abstraction — one raw-I/O boundary for story content.
 *
 * `content.ts` and `storyConfig.ts` go through this so their parsers
 * (gray-matter, yaml.parse) see the same strings whether the underlying
 * bytes came from disk or Postgres.
 *
 * Selection: `CONTENT_SOURCE=fs|db` (env). Default `fs` so local dev and
 * existing build paths keep working until the admin UI is ready.
 *
 * See docs/db-backed-content-plan.md § phase 3.
 */

import fs from 'fs'
import path from 'path'
import { createServiceClient } from './supabase'

export type StoryStatus = 'draft' | 'published' | 'archived'

export interface StoryMeta {
  slug: string
  status: StoryStatus
  listed: boolean
}

export interface ContentSource {
  /** All story slugs plus the minimum metadata needed to filter draft/listed. */
  listStories(): Promise<StoryMeta[]>
  readMarkdown(slug: string): Promise<string | null>
  readConfigYaml(slug: string): Promise<string | null>
  readShareYaml(slug: string): Promise<string | null>
  readChart(slug: string, chartId: string): Promise<unknown | null>
}

// ---------------------------------------------------------------------------
// Filesystem source — mirrors current behavior.

const STORIES_DIR = path.join(process.cwd(), 'content/stories')

function fsReadIfExists(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
}

const fsSource: ContentSource = {
  async listStories(): Promise<StoryMeta[]> {
    if (!fs.existsSync(STORIES_DIR)) return []
    // Parse each markdown's frontmatter to surface status/listed. Fast for 8
    // stories; if the story count grows we can cache at process boot.
    const { default: matter } = await import('gray-matter')
    const slugs = fs
      .readdirSync(STORIES_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
    return slugs.map((slug) => {
      const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.md`), 'utf8')
      const { data } = matter(file)
      const status = (data.status ?? 'published') as StoryStatus
      const listed = data.listed !== false
      return { slug, status, listed }
    })
  },
  async readMarkdown(slug) {
    return fsReadIfExists(path.join(STORIES_DIR, `${slug}.md`))
  },
  async readConfigYaml(slug) {
    return fsReadIfExists(path.join(STORIES_DIR, `${slug}.config.yaml`))
  },
  async readShareYaml(slug) {
    return fsReadIfExists(path.join(STORIES_DIR, `${slug}.share.yaml`))
  },
  async readChart(slug, chartId) {
    const filePath = path.join(STORIES_DIR, slug, 'charts', `${chartId}.json`)
    if (!fs.existsSync(filePath)) return null
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {
      return null
    }
  },
}

// ---------------------------------------------------------------------------
// Supabase source.

const dbSource: ContentSource = {
  async listStories() {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from('stories')
      .select('slug, status, listed')
    if (error) throw new Error(`listStories: ${error.message}`)
    return (data ?? []) as StoryMeta[]
  },
  async readMarkdown(slug) {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from('stories')
      .select('markdown')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new Error(`readMarkdown ${slug}: ${error.message}`)
    return data?.markdown ?? null
  },
  async readConfigYaml(slug) {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from('stories')
      .select('config_yaml')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new Error(`readConfigYaml ${slug}: ${error.message}`)
    return data?.config_yaml ?? null
  },
  async readShareYaml(slug) {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from('stories')
      .select('share_yaml')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new Error(`readShareYaml ${slug}: ${error.message}`)
    return data?.share_yaml ?? null
  },
  async readChart(slug, chartId) {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from('chart_data')
      .select('data')
      .eq('slug', slug)
      .eq('chart_id', chartId)
      .maybeSingle()
    if (error) throw new Error(`readChart ${slug}/${chartId}: ${error.message}`)
    return data?.data ?? null
  },
}

// ---------------------------------------------------------------------------
// Selector.

let resolved: ContentSource | null = null

export function getContentSource(): ContentSource {
  if (resolved) return resolved
  const mode = (process.env.CONTENT_SOURCE ?? 'fs').toLowerCase()
  resolved = mode === 'db' ? dbSource : fsSource
  return resolved
}

// Test / script hook: force a source, bypassing the env var.
export function __setContentSourceForTests(src: ContentSource | null) {
  resolved = src
}
