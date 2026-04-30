export const revalidate = 60

import { notFound } from 'next/navigation'
import { getStoryContent, getViewableStorySlugs } from '@/lib/content'
import { loadStoryConfig, hasStoryConfig, loadShareConfig } from '@/lib/storyConfig'
import { resolveUnits } from '@/lib/resolveUnits'
import { getFontImportUrl } from '@/lib/getFontImports'
import { themedLogoDataUrl } from '@/lib/themeLogo'
import ThemeProvider from '@/components/story/ThemeProvider'
import ShareShell from '@/components/share/ShareShell'

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

export default async function SharePage({ params }: RouteParams) {
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

  const { units, shareUnits, hasShareOverrides } = resolveUnits(slug, story.sections, config)
  const shareConfig = await loadShareConfig(slug)
  const fontImportUrl = getFontImportUrl(story.frontmatter.theme.fonts)
  const logo = await themedLogoDataUrl(shareConfig?.logo, story.frontmatter.theme)

  return (
    <ThemeProvider theme={story.frontmatter.theme}>
      {fontImportUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href={fontImportUrl} rel="stylesheet" />
        </>
      )}
      <ShareShell
        slug={slug}
        units={hasShareOverrides ? shareUnits : units}
        config={config}
        title={story.frontmatter.title}
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
        shareOverrides={shareConfig?.sections ?? null}
        logo={logo}
      />
    </ThemeProvider>
  )
}
