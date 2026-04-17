import { NextResponse } from 'next/server'
import { getAllStorySlugs, getStoryContent } from '@/lib/content'
import { hasStoryConfig, loadStoryConfig, loadShareConfig } from '@/lib/storyConfig'
import { resolveUnits } from '@/lib/resolveUnits'

export function GET() {
  const slugs = getAllStorySlugs().filter((s) => hasStoryConfig(s))
  const stories = slugs.map((slug) => {
    const config = loadStoryConfig(slug)
    const shareConfig = loadShareConfig(slug)
    const story = getStoryContent(slug)
    const { units, mobileUnits, shareUnits } = resolveUnits(
      slug,
      story.sections,
      config
    )
    return { slug, config, shareConfig, units, mobileUnits, shareUnits }
  })
  return NextResponse.json(stories)
}
