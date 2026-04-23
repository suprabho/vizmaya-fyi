/**
 * Prebuild hook: seed new filesystem stories into Supabase before `next build`
 * runs SSG. Stories that already exist in the DB are left untouched — the DB
 * is the source of truth post-publish. Use `npm run migrate-content` for an
 * explicit force-resync.
 *
 * No-ops silently when CONTENT_SOURCE !== 'db' (local dev on fs) or when
 * Supabase credentials are absent so CI builds without a DB connection don't
 * fail hard.
 */

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

  const results = await syncAll({ skipIfExists: true })
  let failed = 0
  for (const r of results) {
    if (!r.ok) { console.error(`[sync] ✗ ${r.slug}: ${r.error}`); failed++ }
    else if (r.skipped) console.log(`[sync] · ${r.slug} (already in DB, skipped)`)
    else console.log(`[sync] ✓ ${r.slug} (seeded)`)
  }
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[sync]', err)
  process.exit(1)
})
