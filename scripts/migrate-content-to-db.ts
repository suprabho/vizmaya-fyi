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

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { syncStory, syncAll, listFsSlugs } from '../lib/syncToDb'

type Args = { slug?: string; dryRun: boolean }

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug') args.slug = argv[++i]
    else if (argv[i] === '--dry-run') args.dryRun = true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const slugs = args.slug ? [args.slug] : listFsSlugs()

  console.log(
    `Migrating ${slugs.length} stor${slugs.length === 1 ? 'y' : 'ies'}${args.dryRun ? ' (dry run)' : ''}`
  )

  if (args.dryRun) {
    for (const slug of slugs) console.log(`  ${slug}`)
    console.log('done (dry run — no writes).')
    return
  }

  const results = args.slug ? [await syncStory(args.slug)] : await syncAll()
  for (const r of results) {
    if (r.ok) console.log(`  ✓ ${r.slug}  charts=${r.charts}`)
    else { console.error(`  ✗ ${r.slug}: ${r.error}`); process.exitCode = 1 }
  }
  console.log('done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
