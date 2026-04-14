/**
 * Build-time audio generation script.
 *
 * Reads each story's content + config, resolves units, converts unit text
 * to narration, calls Gemini TTS, and uploads .wav files to Supabase Storage.
 * Metadata (slug, unit_index, content_hash, public_url) is tracked in the
 * `story_audio` Postgres table so unchanged sections are skipped on re-runs.
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts                       # all stories
 *   npx tsx scripts/generate-audio.ts south-korea-gpu-hour  # one story
 *   npx tsx scripts/generate-audio.ts --force               # regenerate all
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import { createClient } from '@supabase/supabase-js'

// Load .env from project root (simple parser, no dependency needed)
const envPath = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

/* ─── Inline content loading ───────────────────────────────────────── */

const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'content/stories')

interface ContentSection {
  heading: string
  level: number
  body: string[]
}

function getStoryContent(slug: string) {
  const file = fs.readFileSync(path.join(STORIES_DIR, `${slug}.md`), 'utf8')
  const { data, content } = matter(file)
  const sections: ContentSection[] = []
  let current: ContentSection | null = null
  for (const line of content.split('\n')) {
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      if (current) sections.push(current)
      current = { heading: m[2].trim(), level: m[1].length, body: [] }
    } else {
      if (!current) current = { heading: '', level: 0, body: [] }
      current.body.push(line)
    }
  }
  if (current) sections.push(current)
  return { frontmatter: data, sections }
}

function getParagraphs(section: ContentSection): string[] {
  return section.body
    .join('\n')
    .split(/\n\n+/)
    .map((p) => p.trim().replace(/^#{4,6}\s*/, ''))
    .filter((p) => p && !/^-{3,}$/.test(p))
}

function resolveAnchor(sections: ContentSection[], anchor: string): ContentSection | undefined {
  const parts = anchor.split('>').map((s) => s.trim().toLowerCase())
  if (parts.length > 1) {
    let candidates = sections
    for (const part of parts) {
      const stripped = part.replace(/^act\s+[ivxlcdm]+:\s*/i, '')
      const found = candidates.find((s) => s.heading.toLowerCase().includes(stripped))
      if (!found) break
      const idx = sections.indexOf(found)
      candidates = sections.slice(idx)
      if (part === parts[parts.length - 1]) return found
    }
  }
  const last = parts[parts.length - 1].replace(/^act\s+[ivxlcdm]+:\s*/i, '')
  return sections.find((s) => s.heading.toLowerCase().includes(last))
}

function sliceParagraphs(
  all: string[],
  spec: number | [number, number] | undefined
): string[] {
  if (spec === undefined) return all
  if (typeof spec === 'number') return all.slice(spec, spec + 1)
  return all.slice(spec[0], spec[1])
}

interface UnitInfo {
  heading?: string
  paragraphs: string[]
  kind: string
  chart?: string
}

/**
 * Resolve mobile units — the smallest grain. When a section/subsection has
 * `mobileParagraphs`, expand it into one unit per slice. Audio is generated
 * per mobile unit; the desktop player concatenates these segments back-to-back.
 */
function resolveMobileUnitsFlat(slug: string): UnitInfo[] {
  const { sections } = getStoryContent(slug)
  const configPath = path.join(STORIES_DIR, `${slug}.config.yaml`)
  if (!fs.existsSync(configPath)) return []
  const config = parseYaml(fs.readFileSync(configPath, 'utf8'))
  const units: UnitInfo[] = []

  for (const section of config.sections) {
    const kind = section.kind ?? 'text'
    const subs = section.subsections
    if (subs && subs.length > 0) {
      for (const sub of subs) {
        const md = resolveAnchor(sections, sub.text)
        const allP = md ? getParagraphs(md) : []
        const heading = sub.heading ?? md?.heading

        if (sub.mobileParagraphs) {
          sub.mobileParagraphs.forEach((mobileSpec: number | [number, number], sliceIdx: number) => {
            units.push({
              heading: sliceIdx === 0 ? heading : undefined,
              paragraphs: sliceParagraphs(allP, mobileSpec),
              kind,
              chart: section.chart,
            })
          })
        } else {
          units.push({
            heading,
            paragraphs: sliceParagraphs(allP, sub.paragraphs),
            kind,
            chart: section.chart,
          })
        }
      }
    } else if (section.text) {
      const md = resolveAnchor(sections, section.text)
      const allP = md ? getParagraphs(md) : []
      const heading = section.heading ?? md?.heading

      if (section.mobileParagraphs) {
        section.mobileParagraphs.forEach((mobileSpec: number | [number, number], sliceIdx: number) => {
          units.push({
            heading: sliceIdx === 0 ? heading : undefined,
            paragraphs: sliceParagraphs(allP, mobileSpec),
            kind,
            chart: section.chart,
          })
        })
      } else {
        units.push({
          heading,
          paragraphs: sliceParagraphs(allP, section.paragraphs),
          kind,
          chart: section.chart,
        })
      }
    }
  }

  return units
}

/* ─── Text extraction ──────────────────────────────────────────────── */

function unitToNarrationText(unit: UnitInfo): string {
  const parts: string[] = []
  if (unit.heading) parts.push(unit.heading)

  if (unit.kind === 'hero') {
    const dek = unit.paragraphs.find((p) => /^\*[^*]/.test(p))?.replace(/^\*+|\*+$/g, '').trim()
    const byline = unit.paragraphs.find((p) => p.startsWith('**'))?.replace(/^\*+|\*+$/g, '').trim()
    if (dek) parts.push(dek)
    if (byline) parts.push(byline)
  } else if (unit.kind === 'stat') {
    parts.push(unit.paragraphs.join(' '))
  } else {
    const cleaned = unit.paragraphs.map((p) =>
      p.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
    )
    parts.push(...cleaned)
  }

  return parts.filter(Boolean).join('. ')
}

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

/* ─── WAV conversion ───────────────────────────────────────────────── */

interface WavConversionOptions {
  numChannels: number
  sampleRate: number
  bitsPerSample: number
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const buffer = Buffer.alloc(44)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataLength, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataLength, 40)

  return buffer
}

function wrapPcmInWav(pcmData: Buffer): Buffer {
  const header = createWavHeader(pcmData.length, {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16,
  })
  return Buffer.concat([header, pcmData])
}

/* ─── Gemini TTS ───────────────────────────────────────────────────── */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not set in environment.')
  process.exit(1)
}

/**
 * Rate limiter — enforces a minimum interval between Gemini API calls.
 * 8000ms ≈ 7.5 req/min. Override with RATE_LIMIT_MS env var if needed.
 */
const MIN_INTERVAL_MS = Number(process.env.RATE_LIMIT_MS ?? 8000)
let lastCallAt = 0

async function rateLimit() {
  const now = Date.now()
  const elapsed = now - lastCallAt
  if (elapsed < MIN_INTERVAL_MS) {
    const waitMs = MIN_INTERVAL_MS - elapsed
    await new Promise((r) => setTimeout(r, waitMs))
  }
  lastCallAt = Date.now()
}

/**
 * Single Gemini TTS call. Returns the parsed WAV buffer, or an object
 * describing why it failed so the retry layer can decide what to do.
 */
async function callGeminiOnce(
  text: string
): Promise<
  | { ok: true; buffer: Buffer }
  | { ok: false; status: number; retryAfterMs?: number; error: string }
> {
  await rateLimit()
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            temperature: 1.5,
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Orus' },
              },
            },
          },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      // Try to parse a Retry-After hint from the response body
      let retryAfterMs: number | undefined
      try {
        const errJson = JSON.parse(errText)
        const details = errJson?.error?.details ?? []
        for (const d of details) {
          if (d['@type']?.includes('RetryInfo') && typeof d.retryDelay === 'string') {
            const m = d.retryDelay.match(/^([\d.]+)s$/)
            if (m) retryAfterMs = Math.ceil(parseFloat(m[1]) * 1000)
          }
        }
      } catch {
        // body wasn't JSON
      }
      return { ok: false, status: res.status, retryAfterMs, error: errText.slice(0, 200) }
    }

    const data = await res.json()
    const audioPart = data?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { mimeType?: string } }) =>
        p.inlineData?.mimeType?.startsWith('audio/')
    )

    if (!audioPart?.inlineData?.data) {
      return { ok: false, status: 0, error: 'No audio in response' }
    }

    const rawPcm = Buffer.from(audioPart.inlineData.data, 'base64')
    return { ok: true, buffer: wrapPcmInWav(rawPcm) }
  } catch (err) {
    return { ok: false, status: 0, error: String(err) }
  }
}

/**
 * Generate speech with automatic retry on rate-limit (429) and transient
 * server errors (500/503). Honors `Retry-After` hints from Gemini when present.
 */
async function generateSpeech(text: string): Promise<Buffer | null> {
  const MAX_ATTEMPTS = 5
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await callGeminiOnce(text)
    if (result.ok) return result.buffer

    const retryable = result.status === 429 || result.status === 500 || result.status === 503

    if (!retryable || attempt === MAX_ATTEMPTS) {
      console.error(`  Gemini API error ${result.status}: ${result.error}`)
      return null
    }

    // Backoff: honor server hint if present, otherwise exponential (15s, 30s, 60s, 120s).
    const backoffMs =
      result.retryAfterMs ?? Math.min(120_000, 15_000 * Math.pow(2, attempt - 1))
    process.stdout.write(
      `\n  ⚠ ${result.status} — backing off ${Math.round(backoffMs / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS})... `
    )
    await new Promise((r) => setTimeout(r, backoffMs))
  }
  return null
}

/* ─── Supabase ─────────────────────────────────────────────────────── */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'story-audio'

/** Fetch existing audio records for a story from the DB. */
async function getExistingRecords(slug: string): Promise<Map<number, string>> {
  const { data, error } = await supabase
    .from('story_audio')
    .select('unit_index, content_hash')
    .eq('slug', slug)

  if (error) {
    console.error('  DB query error:', error.message)
    return new Map()
  }

  const map = new Map<number, string>()
  for (const row of data ?? []) {
    map.set(row.unit_index, row.content_hash)
  }
  return map
}

/** Upload a WAV buffer to Supabase Storage and upsert metadata into DB. */
async function uploadAudio(
  slug: string,
  unitIndex: number,
  contentHash: string,
  wavBuffer: Buffer
): Promise<string | null> {
  const storagePath = `${slug}/unit-${unitIndex}.wav`

  // Upload to storage (upsert to overwrite if exists)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, wavBuffer, {
      contentType: 'audio/wav',
      upsert: true,
    })

  if (uploadError) {
    console.error(`  Storage upload error: ${uploadError.message}`)
    return null
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Upsert metadata into DB
  const { error: dbError } = await supabase
    .from('story_audio')
    .upsert(
      {
        slug,
        unit_index: unitIndex,
        content_hash: contentHash,
        storage_path: storagePath,
        public_url: publicUrl,
      },
      { onConflict: 'slug,unit_index' }
    )

  if (dbError) {
    console.error(`  DB upsert error: ${dbError.message}`)
    return null
  }

  return publicUrl
}

/* ─── Main ─────────────────────────────────────────────────────────── */

async function processStory(slug: string, force: boolean) {
  console.log(`\n━━━ ${slug} ━━━`)

  // Generate per mobile unit — the smallest grain. Desktop autoplay
  // concatenates these segments back-to-back.
  const units = resolveMobileUnitsFlat(slug)
  if (units.length === 0) {
    console.log('  No units found, skipping.')
    return
  }

  // Fetch existing hashes from DB
  const existingHashes = await getExistingRecords(slug)

  let generated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < units.length; i++) {
    const text = unitToNarrationText(units[i])
    const hash = hashText(text)

    // Skip if hash unchanged in DB
    if (!force && existingHashes.get(i) === hash) {
      console.log(`  [${i + 1}/${units.length}] ✓ unchanged, skipping`)
      skipped++
      continue
    }

    if (text.length < 5) {
      console.log(`  [${i + 1}/${units.length}] ⊘ text too short, skipping`)
      skipped++
      continue
    }

    process.stdout.write(`  [${i + 1}/${units.length}] generating... `)

    const audioBuffer = await generateSpeech(text)
    if (audioBuffer) {
      const publicUrl = await uploadAudio(slug, i, hash, audioBuffer)
      if (publicUrl) {
        console.log(`✓ ${(audioBuffer.length / 1024).toFixed(0)}KB → Supabase`)
        generated++
      } else {
        console.log('✗ upload failed')
        failed++
      }
    } else {
      console.log('✗ TTS failed')
      failed++
    }
  }

  console.log(`  Done: ${generated} generated, ${skipped} skipped, ${failed} failed`)
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const slugs = args.filter((a) => !a.startsWith('--'))

  const storySlugs =
    slugs.length > 0
      ? slugs
      : fs
          .readdirSync(STORIES_DIR)
          .filter((f) => f.endsWith('.config.yaml'))
          .map((f) => f.replace('.config.yaml', ''))

  console.log(`Audio generation for: ${storySlugs.join(', ')}`)
  if (force) console.log('(--force: regenerating all)')

  for (const slug of storySlugs) {
    await processStory(slug, force)
  }

  console.log('\nAll done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
