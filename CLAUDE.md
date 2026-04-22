# Claude context for vizmaya-fyi

## Active initiative: DB-backed content

Branch `feat/db-backed-content` is migrating story content (markdown + yaml + chart JSON) from the filesystem into Supabase Postgres so edits can go live without redeploying code.

**Plan + phase breakdown:** [docs/db-backed-content-plan.md](docs/db-backed-content-plan.md) — read this before making changes in this area.

Key points:
- Storage is **blob, not normalized** — one row per story with raw md/yaml as text columns. Keeps `gray-matter` / `yaml.parse` unchanged.
- Supabase is already wired (`lib/supabase.ts`, migrations 001–004). Next migration: 005.
- Readers route through `lib/contentSource.ts` (to be built) with `CONTENT_SOURCE=fs|db` env var — preserves local dev loop on `fs`.
- Files in `content/stories/` stay in git as backup during cutover.

## Content structure (current)

Per story in `content/stories/`:
- `<slug>.md` — prose + YAML frontmatter
- `<slug>.config.yaml` — map/scroll/chart config (550–750 lines)
- `<slug>.share.yaml` — social card definitions
- `<slug>/charts/*.json` — chart data served at runtime by `app/api/chart-data/[slug]/[id]/route.ts`

Readers: `lib/content.ts`, `lib/storyConfig.ts`. Rendering: SSG via `generateStaticParams` in `app/story/[slug]/page.tsx`.
