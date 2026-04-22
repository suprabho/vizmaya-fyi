import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import { getContentSource } from '@/lib/contentSource'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  if (!(await isAuthed())) redirect('/admin/login?next=/admin')
  const src = getContentSource()
  const stories = await src.listStories()

  const withTitles = await Promise.all(
    stories.map(async (s) => {
      const md = await src.readMarkdown(s.slug)
      const titleMatch = md?.match(/^title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/m)
      const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? titleMatch?.[3] ?? s.slug).trim()
      return { ...s, title }
    })
  )
  const sorted = withTitles.sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-5 border-b border-white/5">
        <h1 className="text-lg font-semibold">Stories</h1>
        <p className="text-sm text-neutral-400 mt-0.5">{sorted.length} total</p>
      </div>
      <ul className="divide-y divide-white/5">
        {sorted.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/admin/${s.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-4 active:bg-white/5 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-neutral-500 truncate mt-0.5">{s.slug}</div>
              </div>
              <StatusPill status={s.status} listed={s.listed} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusPill({ status, listed }: { status: string; listed: boolean }) {
  const tone =
    status === 'published' && listed
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
      : status === 'draft'
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
        : 'bg-white/5 text-neutral-400 border-white/10'
  const label = status === 'published' && !listed ? 'unlisted' : status
  return (
    <span
      className={`shrink-0 text-[11px] uppercase tracking-wider border rounded-full px-2 py-0.5 ${tone}`}
    >
      {label}
    </span>
  )
}
