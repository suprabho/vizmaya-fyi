/**
 * One-shot migration: filesystem content/stories/ → Supabase `stories` + `chart_data`.
 *
 * Usage:
 *   npx tsx scripts/migrate-content-to-db.ts              # migrate all stories
 *   npx tsx scripts/migrate-content-to-db.ts --slug foo   # migrate one
 *   npx tsx scripts/migrate-content-to-db.ts --dry-run    # no writes
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Idempotent — re-running replaces existing rows via upsert.
 * Files stay on disk as backup (plan § phase 2).
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createServiceClient } from '../lib/supabase'
import type { Frontmatter } from '../types/story'

const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'content/stories')

type Args = { slug?: string; dryRun: boolean }

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug') args.slug = argv[++i]
    else if (argv[i] === '--dry-run') args.dryRun = true
  }
  return args
}

function listSlugs(): string[] {
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

function readIfExists(p: string): string | null {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
}

function listChartFiles(slug: string): string[] {
  const dir = path.join(STORIES_DIR, slug, 'charts')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f))
}

async function migrateStory(slug: string, dryRun: boolean) {
  const mdPath = path.join(STORIES_DIR, `${slug}.md`)
  const markdown = readIfExists(mdPath)
  if (!markdown) throw new Error(`missing ${mdPath}`)

  const { data } = matter(markdown)
  const fm = data as Frontmatter
  const configYaml = readIfExists(path.join(STORIES_DIR, `${slug}.config.yaml`))
  const shareYaml = readIfExists(path.join(STORIES_DIR, `${slug}.share.yaml`))

  const row = {
    slug,
    title: fm.title ?? slug,
    status: (fm.status ?? 'published') as string,
    listed: fm.listed !== false,
    markdown,
    config_yaml: configYaml,
    share_yaml: shareYaml,
    // updated_at defaults to now() on insert; on upsert we want to bump it.
    updated_at: new Date().toISOString(),
    published_at:
      (fm.status ?? 'published') === 'published'
        ? new Date().toISOString()
        : null,
  }

  const charts = listChartFiles(slug).map((filePath) => {
    const chartId = path.basename(filePath, '.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { slug, chart_id: chartId, data, updated_at: new Date().toISOString() }
  })

  console.log(
    `  ${slug}  status=${row.status} listed=${row.listed} charts=${charts.length}`
  )

  if (dryRun) return

  const sb = createServiceClient()

  const { error: storyErr } = await sb
    .from('stories')
    .upsert(row, { onConflict: 'slug' })
  if (storyErr) throw new Error(`stories upsert ${slug}: ${storyErr.message}`)

  if (charts.length > 0) {
    const { error: chartErr } = await sb
      .from('chart_data')
      .upsert(charts, { onConflict: 'slug,chart_id' })
    if (chartErr) throw new Error(`chart_data upsert ${slug}: ${chartErr.message}`)
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const slugs = args.slug ? [args.slug] : listSlugs()

  console.log(
    `Migrating ${slugs.length} stor${slugs.length === 1 ? 'y' : 'ies'}${
      args.dryRun ? ' (dry run)' : ''
    }`
  )

  for (const slug of slugs) {
    try {
      await migrateStory(slug, args.dryRun)
    } catch (err) {
      console.error(`  ✗ ${slug}:`, err instanceof Error ? err.message : err)
      process.exitCode = 1
    }
  }

  console.log('done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
