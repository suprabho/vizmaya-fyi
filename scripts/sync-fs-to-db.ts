/**
 * Prebuild hook: sync filesystem stories into Supabase before `next build`
 * runs SSG. During the cutover phase (docs/db-backed-content-plan.md) the
 * filesystem remains source of truth, so every build force-upserts every
 * story (markdown + config.yaml + share.yaml + chart JSONs).
 *
 * Set SYNC_SKIP_EXISTING=true to fall back to seed-only mode (skip stories
 * already in DB) — appropriate once an admin UI ships and DB edits must be
 * preserved across deploys.
 *
 * No-ops silently when CONTENT_SOURCE !== 'db' (local dev on fs) or when
 * Supabase credentials are absent so CI builds without a DB connection don't
 * fail hard.
 *
 * Loads env via @next/env so this script sees the same CONTENT_SOURCE,
 * NEXT_PUBLIC_SUPABASE_URL, etc. that the `next build` process will see.
 * Without this, `npx tsx` sees no .env/.env.local and defaults to fs mode,
 * which would skip the sync even when the build itself is reading from DB.
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { syncAll } from '../lib/syncToDb'

async function main() {
  const mode = (process.env.CONTENT_SOURCE ?? 'fs').toLowerCase()
  if (mode !== 'db') {
    console.log('[sync] CONTENT_SOURCE=fs — skipping DB sync')
    return
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[sync] Supabase credentials missing — skipping DB sync')
    return
  }

  const skipIfExists = process.env.SYNC_SKIP_EXISTING === 'true'
  const results = await syncAll({ skipIfExists })
  let failed = 0
  for (const r of results) {
    if (!r.ok) { console.error(`[sync] ✗ ${r.slug}: ${r.error}`); failed++ }
    else if (r.skipped) console.log(`[sync] · ${r.slug} (already in DB, skipped)`)
    else console.log(`[sync] ✓ ${r.slug} (${skipIfExists ? 'seeded' : 'upserted'})`)
  }
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[sync]', err)
  process.exit(1)
})
