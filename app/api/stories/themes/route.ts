import { getAllStorySlugs, getStoryContent } from '@/lib/content'
import { NextResponse } from 'next/server'

export function GET() {
  const slugs = getAllStorySlugs()
  const stories = slugs.map((slug) => {
    const { frontmatter } = getStoryContent(slug)
    return {
      slug,
      title: frontmatter.title,
      theme: frontmatter.theme,
    }
  })
  return NextResponse.json(stories)
}
