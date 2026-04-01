import { getAllStoryIds, getStoryById } from '@/lib/stories'
import { parseMarkdown } from '@/lib/markdown-parser'
import StoryRenderer from '@/components/story/StoryRenderer'
import { Metadata } from 'next'

export async function generateStaticParams() {
  const ids = await getAllStoryIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { frontmatter } = await getStoryById(id)
  return {
    title: `${frontmatter.title} — ${frontmatter.subtitle}`,
    description: frontmatter.subtitle,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.subtitle,
    },
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { frontmatter, content } = await getStoryById(id)
  const blocks = parseMarkdown(content)

  return (
    <StoryRenderer
      blocks={blocks}
      theme={frontmatter.theme}
      meta={frontmatter}
    />
  )
}
