import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Frontmatter } from '@/types/story'

const STORIES_DIR = path.join(process.cwd(), 'content/stories')

export interface ContentSection {
  heading: string
  level: number
  body: string[]
}

export interface StoryContent {
  frontmatter: Frontmatter
  sections: ContentSection[]
  raw: string
}

/**
 * A story is viewable at its URL unless it's an unpublished draft in production.
 * Drafts stay accessible in dev so authors can preview them locally.
 */
export function isViewable(fm: Pick<Frontmatter, 'status'>): boolean {
  if (fm.status === 'draft') return process.env.NODE_ENV !== 'production'
  return true
}

/**
 * A story appears on the home grid only when it's actively published and not
 * explicitly unlisted. Archived stories remain reachable by URL but drop off
 * the index.
 */
export function isListed(fm: Pick<Frontmatter, 'status' | 'listed'>): boolean {
  const status = fm.status ?? 'published'
  if (status !== 'published') return false
  return fm.listed !== false
}

/**
 * Reads a story markdown file and returns frontmatter + content split into sections by heading.
 * Each story page decides how to use these sections.
 *
 * Throws for drafts in production so the story route renders a 404 rather than
 * leaking unfinished work.
 */
export function getStoryContent(slug: string): StoryContent {
  const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.md`), 'utf8')
  const { data, content } = matter(file)

  const frontmatter = data as Frontmatter
  if (!isViewable(frontmatter)) {
    throw new Error(`Story "${slug}" is a draft and not viewable in this environment`)
  }

  const sections: ContentSection[] = []
  let current: ContentSection | null = null

  for (const line of content.split('\n')) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      if (current) sections.push(current)
      current = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        body: [],
      }
    } else {
      if (!current) {
        // Content before first heading — create an implicit intro section
        current = { heading: '', level: 0, body: [] }
      }
      current.body.push(line)
    }
  }
  if (current) sections.push(current)

  return { frontmatter, sections, raw: content }
}

/**
 * Find a section by heading text (case-insensitive partial match).
 */
export function findSection(sections: ContentSection[], query: string): ContentSection | undefined {
  return sections.find((s) => s.heading.toLowerCase().includes(query.toLowerCase()))
}

/**
 * Find all sections matching a query.
 */
export function findSections(sections: ContentSection[], query: string): ContentSection[] {
  return sections.filter((s) => s.heading.toLowerCase().includes(query.toLowerCase()))
}

/**
 * Get all subsections (### headings) that follow a given section until the next same-or-higher level heading.
 */
export function getSubsections(sections: ContentSection[], parentHeading: string): ContentSection[] {
  const parentIdx = sections.findIndex((s) => s.heading.toLowerCase().includes(parentHeading.toLowerCase()))
  if (parentIdx === -1) return []
  const parent = sections[parentIdx]
  const result: ContentSection[] = []
  for (let i = parentIdx + 1; i < sections.length; i++) {
    if (sections[i].level <= parent.level) break
    result.push(sections[i])
  }
  return result
}

/**
 * Extract clean paragraphs from a section body (strips empty lines).
 *
 * Strips leading `####` markers — the editorial markdown sometimes uses
 * `####**Label**` to style a bullet without making it a real heading. We
 * preserve the inline `**bold**` but drop the heading prefix so the renderer
 * treats them as regular bullet paragraphs. Horizontal rules (`---`) are
 * dropped so YAML `paragraphs: N` indices stay aligned with the visible
 * paragraphs of a section instead of slipping by 1 whenever a section ends
 * with a `---` separator.
 */
export function getParagraphs(section: ContentSection): string[] {
  return section.body
    .join('\n')
    .split(/\n\n+/)
    .map((p) => p.trim().replace(/^#{4,6}\s*/, ''))
    .filter((p) => p && !/^-{3,}$/.test(p))
}

/**
 * Parse a table from section body lines. Returns headers + rows.
 */
export function parseTable(body: string[]): { headers: string[]; rows: string[][] } | null {
  const tableLines = body.filter((l) => l.trim().startsWith('|'))
  if (tableLines.length < 2) return null

  const parseRow = (line: string) =>
    line.split('|').map((c) => c.trim()).filter((c) => c && !/^-+$/.test(c))

  return {
    headers: parseRow(tableLines[0]),
    rows: tableLines.slice(2).map(parseRow).filter((r) => r.length > 0),
  }
}

/**
 * Extract bold-prefixed items from body (e.g. "**For investors:** content...").
 */
export function parseBoldItems(body: string[]): { label: string; content: string }[] {
  const text = body.join('\n')
  const items: { label: string; content: string }[] = []
  const matches = text.matchAll(/\*\*(?:For )?([^*]+?)[:]*\*\*[:\s]*([\s\S]*?)(?=\n\*\*|$)/g)
  for (const m of matches) {
    items.push({ label: m[1].replace(/:$/, '').trim(), content: m[2].trim() })
  }
  return items
}

/**
 * Get all story slugs from the content directory.
 */
export function getAllStorySlugs(): string[] {
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

/**
 * Get summary info for stories shown on the home grid. Filters out drafts,
 * archived stories, and anything explicitly marked `listed: false`.
 */
export function getAllStories() {
  return getAllStorySlugs()
    .map((slug) => {
      const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.md`), 'utf8')
      const { data } = matter(file)
      return { slug, frontmatter: data as Frontmatter }
    })
    .filter(({ frontmatter }) => isListed(frontmatter))
    .map(({ slug, frontmatter }) => ({ slug, ...frontmatter }))
}

/**
 * Slugs whose story page should render (i.e. not a draft in production).
 * Used by generateStaticParams so drafts don't get pre-rendered on deploy.
 */
export function getViewableStorySlugs(): string[] {
  return getAllStorySlugs().filter((slug) => {
    const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.md`), 'utf8')
    const { data } = matter(file)
    return isViewable(data as Frontmatter)
  })
}
