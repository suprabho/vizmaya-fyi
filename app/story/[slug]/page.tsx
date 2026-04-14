import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStoryContent, getAllStorySlugs } from '@/lib/content'
import { loadStoryConfig, hasStoryConfig } from '@/lib/storyConfig'
import { resolveUnits } from '@/lib/resolveUnits'
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
    const title = `${frontmatter.title} — ${frontmatter.subtitle}`
    const url = `/story/${slug}`

    return {
      title,
      description: frontmatter.subtitle,
      authors: [{ name: frontmatter.byline }],
      openGraph: {
        type: 'article',
        title: frontmatter.title,
        description: frontmatter.subtitle,
        url,
        siteName: 'vizzmaya',
        locale: 'en_US',
        publishedTime: frontmatter.date,
      },
      twitter: {
        card: 'summary_large_image',
        title: frontmatter.title,
        description: frontmatter.subtitle,
      },
      alternates: {
        canonical: url,
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

  const { units, mobileUnits, hasMobileOverrides } = resolveUnits(
    slug,
    story.sections,
    config
  )

  return (
    <ThemeProvider theme={story.frontmatter.theme}>
      <StoryMapShell
        units={units}
        mobileUnits={hasMobileOverrides ? mobileUnits : undefined}
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
        defaults={config.defaults}
      />
    </ThemeProvider>
  )
}
