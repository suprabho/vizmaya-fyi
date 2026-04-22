import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/adminAuth'
import { getContentSource } from '@/lib/contentSource'

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const stories = await getContentSource().listStories()
  // Titles live in the markdown frontmatter; fetching for 8 stories is fine.
  const src = getContentSource()
  const withTitles = await Promise.all(
    stories.map(async (s) => {
      const md = await src.readMarkdown(s.slug)
      const titleMatch = md?.match(/^title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/m)
      const title = titleMatch?.[1] ?? titleMatch?.[2] ?? titleMatch?.[3] ?? s.slug
      return { ...s, title: title.trim() }
    })
  )
  return NextResponse.json(withTitles)
}
