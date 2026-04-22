import { getAllStories } from '@/lib/content'
import HomeClient, { type HomeStory } from '@/components/HomeClient'

export default async function HomePage() {
  const stories = await getAllStories()
  const homeStories: HomeStory[] = stories.map((s) => ({
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    date: s.date,
    byline: s.byline ?? '',
  }))
  return <HomeClient stories={homeStories} />
}
