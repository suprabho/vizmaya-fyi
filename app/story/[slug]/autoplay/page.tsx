import { notFound } from 'next/navigation'
import { getStoryContent, getViewableStorySlugs } from '@/lib/content'
import { loadStoryConfig, hasStoryConfig } from '@/lib/storyConfig'
import { resolveUnits } from '@/lib/resolveUnits'
import ThemeProvider from '@/components/story/ThemeProvider'
import AutoplayShell from '@/components/autoplay/AutoplayShell'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getViewableStorySlugs()
  const withConfig = await Promise.all(
    slugs.map(async (slug) => ((await hasStoryConfig(slug)) ? slug : null))
  )
  return withConfig.filter((s): s is string => s !== null).map((slug) => ({ slug }))
}

export default async function AutoplayPage({ params }: RouteParams) {
  const { slug } = await params

  let story
  let config
  try {
    story = await getStoryContent(slug)
    if (!(await hasStoryConfig(slug))) notFound()
    config = await loadStoryConfig(slug)
  } catch {
    notFound()
  }

  const { units, mobileUnits, desktopToMobile, hasMobileOverrides } = resolveUnits(
    slug,
    story.sections,
    config
  )

  return (
    <ThemeProvider theme={story.frontmatter.theme}>
      <AutoplayShell
        slug={slug}
        title={story.frontmatter.title}
        units={units}
        mobileUnits={hasMobileOverrides ? mobileUnits : undefined}
        desktopToMobile={desktopToMobile}
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
        defaults={config.defaults}
      />
    </ThemeProvider>
  )
}
