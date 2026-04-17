import { getAllStories } from '@/lib/content'
import HomeClient, { type HomeStory } from '@/components/HomeClient'

export default function HomePage() {
  const stories: HomeStory[] = getAllStories()
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      date: s.date,
      byline: s.byline,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return <HomeClient stories={stories} />
}
