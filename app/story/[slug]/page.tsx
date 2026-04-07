import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStoryContent, getAllStorySlugs, getParagraphs } from '@/lib/content'
import { loadStoryConfig, hasStoryConfig } from '@/lib/storyConfig'
import type { ResolvedUnit } from '@/lib/storyConfig.types'
import { resolveAnchor } from '@/lib/contentAnchors'
import ThemeProvider from '@/components/story/ThemeProvider'
import StoryMapShell from '@/components/story/StoryMapShell'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllStorySlugs()
    .filter((slug) => hasStoryConfig(slug))
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter } = getStoryContent(slug)
    return {
      title: `${frontmatter.title} — ${frontmatter.subtitle}`,
      description: frontmatter.subtitle,
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.subtitle,
      },
    }
  } catch {
    return {}
  }
}

export default async function StoryPage({ params }: RouteParams) {
  const { slug } = await params

  let story
  let config
  try {
    story = getStoryContent(slug)
    if (!hasStoryConfig(slug)) notFound()
    config = loadStoryConfig(slug)
  } catch {
    notFound()
  }

  // Flatten sections + subsections into renderable units. Each unit is one
  // viewport-tall snap target. Sections with N subsections expand into N units
  // that share the parent's map state and chart but have their own text anchor.
  // Misses are warned but not fatal — the section renders an empty placeholder.
  const units: ResolvedUnit[] = []
  config.sections.forEach((section, parentIndex) => {
    const subs = section.subsections
    if (subs && subs.length > 0) {
      subs.forEach((sub, subIndex) => {
        const md = resolveAnchor(story!.sections, sub.text)
        if (!md) console.warn(`[story:${slug}] anchor not found: "${sub.text}"`)
        units.push({
          parentIndex,
          subIndex,
          parentConfig: section,
          heading: md?.heading,
          paragraphs: md ? getParagraphs(md) : [],
        })
      })
    } else if (section.text) {
      const md = resolveAnchor(story!.sections, section.text)
      if (!md) console.warn(`[story:${slug}] anchor not found: "${section.text}"`)
      units.push({
        parentIndex,
        subIndex: 0,
        parentConfig: section,
        heading: md?.heading,
        paragraphs: md ? getParagraphs(md) : [],
      })
    }
  })

  return (
    <ThemeProvider theme={story.frontmatter.theme}>
      <StoryMapShell
        units={units}
        sectionConfigs={config.sections}
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
        defaults={config.defaults}
      />
    </ThemeProvider>
  )
}
