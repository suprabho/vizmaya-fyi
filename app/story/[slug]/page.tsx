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
  //
  // Paragraph slicing: a subsection (or top-level section) may set `paragraphs:
  // 0` or `paragraphs: [0, 2]` to pull just one or a slice of paragraphs from
  // the resolved anchor. This is how we reveal bullets one-by-one as a chart's
  // activeStep advances — without re-pulling the same anchor and re-rendering
  // the whole text block per chart step.
  const sliceParagraphs = (
    all: string[],
    spec: number | [number, number] | undefined
  ): string[] => {
    if (spec === undefined) return all
    if (typeof spec === 'number') return all.slice(spec, spec + 1)
    return all.slice(spec[0], spec[1])
  }

  const units: ResolvedUnit[] = []
  config.sections.forEach((section, parentIndex) => {
    const subs = section.subsections
    if (subs && subs.length > 0) {
      subs.forEach((sub, subIndex) => {
        const md = resolveAnchor(story!.sections, sub.text)
        if (!md) console.warn(`[story:${slug}] anchor not found: "${sub.text}"`)
        const allParagraphs = md ? getParagraphs(md) : []
        units.push({
          parentIndex,
          subIndex,
          parentConfig: section,
          heading: sub.heading ?? md?.heading,
          paragraphs: sliceParagraphs(allParagraphs, sub.paragraphs),
        })
      })
    } else if (section.text) {
      const md = resolveAnchor(story!.sections, section.text)
      if (!md) console.warn(`[story:${slug}] anchor not found: "${section.text}"`)
      const allParagraphs = md ? getParagraphs(md) : []
      units.push({
        parentIndex,
        subIndex: 0,
        parentConfig: section,
        heading: section.heading ?? md?.heading,
        paragraphs: sliceParagraphs(allParagraphs, section.paragraphs),
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
