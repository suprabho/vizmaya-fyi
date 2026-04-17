import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STORIES_DIR = path.join(process.cwd(), 'content/stories')
const SAFE_ID = /^[a-zA-Z0-9_-]+$/

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params

  // Defensive: the API reads straight from disk, so reject anything that
  // could escape the charts directory (e.g. "../../.env").
  if (!SAFE_ID.test(slug) || !SAFE_ID.test(id)) {
    return NextResponse.json({ error: 'invalid slug or id' }, { status: 400 })
  }

  const filePath = path.join(STORIES_DIR, slug, 'charts', `${id}.json`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'chart not found' }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 500 })
  }
}
