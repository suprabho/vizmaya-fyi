import type { Metadata } from 'next'
import { getAllStories } from '@/lib/content'
import HomeClient, { type HomeStory } from '@/components/HomeClient'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'vizmaya — Visual Stories',
  description:
    'Data-driven narratives on geopolitics, technology, and the asymmetries that reshape markets.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const stories = await getAllStories()
  const homeStories: HomeStory[] = stories.map((s) => ({
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    date: s.date,
    byline: s.byline ?? '',
    aura: s.aura,
    theme: s.theme,
  }))
  return <HomeClient stories={homeStories} />
}
