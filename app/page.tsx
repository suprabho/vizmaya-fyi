import { getAllStories } from '@/lib/content'
import Link from 'next/link'

export default async function HomePage() {
  const stories = getAllStories()

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0e14', color: '#e0ddd5' }}
    >
      <div className="max-w-[860px] mx-auto px-8 py-20">
        <div className="mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-[#D85A30] mb-4">
            vizzmaya
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-tight mb-3">
            Visual Stories
          </h1>
          <p className="text-[#5a6a70] text-lg max-w-[480px]">
            Data-driven narratives on geopolitics, technology, and the
            asymmetries that reshape markets.
          </p>
        </div>

        <div className="space-y-1">
          {stories.map((story) => (
            <Link
              key={story.slug}
              href={`/story/${story.slug}`}
              className="group block py-6 border-b transition-colors"
              style={{ borderColor: '#1a2830' }}
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <h2 className="font-serif text-xl font-bold text-white group-hover:text-[#D85A30] transition-colors mb-1">
                    {story.title}
                  </h2>
                  <p className="text-[#5a6a70] text-sm">{story.subtitle}</p>
                </div>
                <div className="font-mono text-xs text-[#5a6a70] uppercase tracking-wider whitespace-nowrap pt-1">
                  {new Date(story.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 text-center">
          <span className="font-mono text-xs tracking-[0.12em] text-[#5a6a70]">
            <span className="text-[#D85A30]">vizzmaya</span> · The Asymmetry
            Letter
          </span>
        </div>
      </div>
    </div>
  )
}
