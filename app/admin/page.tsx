'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminHome() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stories')
      .then((r) => r.json())
      .then((data) => {
        const sorted = data.sort((a: any, b: any) => a.title.localeCompare(b.title))
        setStories(sorted)
        setLoading(false)
      })
  }, [])

  async function updateMeta(slug: string, meta: Partial<{ status: string; listed: boolean; displayOrder: number | null }>) {
    setUpdating(slug)
    const res = await fetch(`/api/admin/stories/${slug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(meta),
    })
    if (res.ok) {
      setStories((prev) =>
        prev.map((s) => (s.slug === slug ? { ...s, ...meta } : s))
      )
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400">
        Loading stories…
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-5 border-b border-white/5">
        <h1 className="text-lg font-semibold">Stories</h1>
        <p className="text-sm text-neutral-400 mt-0.5">{stories.length} total</p>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500">
        <div className="flex-1">Title</div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-[104px] text-right">Status</div>
          <div className="w-4 text-center" title="Listed on home">L</div>
          <div className="w-16 text-right">Order</div>
        </div>
      </div>
      <ul className="divide-y divide-white/5">
        {stories.map((s) => (
          <li key={s.slug}>
            <div className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-white/2.5 transition-colors">
              <Link
                href={`/admin/${s.slug}`}
                className="flex-1 min-w-0 flex flex-col active:bg-white/5"
              >
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-neutral-500 truncate mt-0.5">{s.slug}</div>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1">
                  <select
                    value={s.status}
                    onChange={(e) => updateMeta(s.slug, { status: e.target.value })}
                    disabled={updating === s.slug}
                    className="text-xs bg-neutral-900 border border-white/10 rounded px-2 py-1 text-neutral-300 cursor-pointer disabled:opacity-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <input
                  type="checkbox"
                  checked={s.listed}
                  onChange={(e) => updateMeta(s.slug, { listed: e.target.checked })}
                  disabled={updating === s.slug}
                  className="w-4 h-4 cursor-pointer disabled:opacity-50"
                  title="Show on home page"
                />
                <input
                  type="number"
                  value={s.displayOrder != null ? String(s.displayOrder) : ''}
                  placeholder="#"
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                    updateMeta(s.slug, { displayOrder: val })
                  }}
                  disabled={updating === s.slug}
                  className="w-16 text-sm bg-neutral-900 border border-white/20 rounded px-2 py-1 text-white cursor-pointer disabled:opacity-50 placeholder:text-neutral-600"
                  title="Display order (0-indexed, lower first)"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

