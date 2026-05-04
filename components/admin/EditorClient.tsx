'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeEditor from './ThemeEditor'
import YamlCardsView from './YamlCardsView'
import FileActions from './FileActions'
import { parseFrontmatter, serializeFrontmatter } from '@/lib/frontmatter'
import { useTabIndent } from '@/lib/useTabIndent'
import type { Theme } from '@/types/story'

type Tab = 'theme' | 'markdown' | 'config' | 'share' | 'charts' | 'settings'

interface InitialState {
  markdown: string
  config_yaml: string
  share_yaml: string
  charts: string[]
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'theme', label: 'Theme' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'config', label: 'Config' },
  { id: 'share', label: 'Share' },
  { id: 'charts', label: 'Charts' },
  { id: 'settings', label: 'Settings' },
]

export default function EditorClient({ slug, initial }: { slug: string; initial: InitialState }) {
  const [tab, setTab] = useState<Tab>('theme')
  const [markdown, setMarkdown] = useState(initial.markdown)
  const [config, setConfig] = useState(initial.config_yaml)
  const [share, setShare] = useState(initial.share_yaml)
  const [saving, start] = useTransition()
  const [apiStatus, setApiStatus] = useState<{ type: 'idle' | 'ok' | 'err' | 'warn'; msg?: string }>({ type: 'idle' })

  const parsed = useMemo(() => parseFrontmatter(markdown), [markdown])
  const theme = (parsed.data.theme ?? undefined) as Partial<Theme> | undefined

  function updateTheme(next: Theme) {
    const nextData = { ...parsed.data, theme: next }
    setMarkdown(serializeFrontmatter(nextData, parsed.body))
  }

  function updateMetadata(meta: Partial<{ status: string; listed: boolean; order: number }>) {
    const nextData = { ...parsed.data, ...meta }
    setMarkdown(serializeFrontmatter(nextData, parsed.body))
  }

  const dirty = useMemo(
    () =>
      markdown !== initial.markdown ||
      config !== initial.config_yaml ||
      share !== initial.share_yaml,
    [markdown, config, share, initial]
  )

  // Warn before navigating away with unsaved work.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Cmd/Ctrl+S to save (desktop).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (dirty && !saving) save()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, saving, markdown, config, share])

  function save() {
    start(async () => {
      setApiStatus({ type: 'idle' })
      const payload: Record<string, any> = {}
      if (markdown !== initial.markdown) payload.markdown = markdown
      if (config !== initial.config_yaml) payload.config_yaml = config.length === 0 ? null : config
      if (share !== initial.share_yaml) payload.share_yaml = share.length === 0 ? null : share
      if (parsed.data.status) payload.status = parsed.data.status
      if (parsed.data.listed !== undefined) payload.listed = parsed.data.listed
      if (parsed.data.displayOrder !== undefined) payload.displayOrder = parsed.data.displayOrder
      const res = await fetch(`/api/admin/stories/${slug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setApiStatus({ type: 'err', msg: body?.error ?? `HTTP ${res.status}` })
        return
      }
      if (body?.warning) {
        setApiStatus({ type: 'warn', msg: body.error ?? body.warning })
      } else {
        setApiStatus({ type: 'ok', msg: 'Saved' })
      }
      // Update baseline so dirty goes false.
      initial.markdown = markdown
      initial.config_yaml = config
      initial.share_yaml = share
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <Link href="/admin" className="text-neutral-400 hover:text-white text-sm shrink-0">
          ← all
        </Link>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-neutral-500 truncate">{slug}</div>
        </div>
        <Link
          href={`/story/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-400 hover:text-white shrink-0"
        >
          preview ↗
        </Link>
      </div>

      <nav className="flex gap-1 px-2 py-2 border-b border-white/5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id
                ? 'bg-white/10 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
            {t.id === 'charts' && initial.charts.length > 0 && (
              <span className="ml-1.5 text-xs text-neutral-500">{initial.charts.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-h-0">
        {tab === 'theme' && <ThemeEditor theme={theme} onChange={updateTheme} />}
        {tab === 'markdown' && (
          <>
            <FileActions
              filename={`${slug}.md`}
              accept=".md,.markdown,text/markdown"
              mime="text/markdown;charset=utf-8"
              value={markdown}
              onUpload={setMarkdown}
            />
            <CodeArea value={markdown} onChange={setMarkdown} />
          </>
        )}
        {tab === 'config' && (
          <>
            <FileActions
              filename={`${slug}.config.yaml`}
              accept=".yaml,.yml,text/yaml,application/yaml"
              mime="application/yaml;charset=utf-8"
              value={config}
              onUpload={setConfig}
            />
            <YamlCardsView
              value={config}
              onChange={setConfig}
              placeholder="# no config yet — paste YAML to create"
            />
          </>
        )}
        {tab === 'share' && (
          <>
            <FileActions
              filename={`${slug}.share.yaml`}
              accept=".yaml,.yml,text/yaml,application/yaml"
              mime="application/yaml;charset=utf-8"
              value={share}
              onUpload={setShare}
            />
            <CodeArea
              value={share}
              onChange={setShare}
              placeholder="# no share overrides — paste YAML to create"
            />
          </>
        )}
        {tab === 'charts' && <ChartsList slug={slug} charts={initial.charts} />}
        {tab === 'settings' && (
          <SettingsPanel
            status={(parsed.data.status as string) ?? 'published'}
            listed={parsed.data.listed !== false}
            displayOrder={typeof parsed.data.displayOrder === 'number' ? parsed.data.displayOrder : null}
            onChange={updateMetadata}
          />
        )}
      </div>

      <div
        className="sticky bottom-0 border-t border-white/10 bg-neutral-950/95 backdrop-blur flex items-center gap-3 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      >
        <StatusBadge status={apiStatus} dirty={dirty} />
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={save}
          className="ml-auto bg-white text-neutral-950 rounded-lg px-5 py-2.5 font-medium disabled:opacity-40 active:bg-neutral-200"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function CodeArea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const onKeyDown = useTabIndent()
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      spellCheck={false}
      autoCapitalize="none"
      autoCorrect="off"
      className="flex-1 min-h-0 w-full bg-neutral-950 text-neutral-100 font-mono text-[13px] leading-relaxed p-4 resize-none outline-none focus:bg-neutral-900/40"
    />
  )
}

function ChartsList({ slug, charts: initialCharts }: { slug: string; charts: string[] }) {
  const [charts, setCharts] = useState(initialCharts)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function downloadChart(id: string) {
    setError(null)
    const res = await fetch(`/api/admin/stories/${slug}/charts/${id}`)
    if (!res.ok) {
      setError(`Failed to fetch ${id}.json (HTTP ${res.status})`)
      return
    }
    const body = await res.json()
    const text = JSON.stringify(body.data, null, 2) + '\n'
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${id}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function uploadChart(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    // Filename (sans .json) becomes the chart id; the API restricts ids to
    // [a-zA-Z0-9_-], so reject anything else early with a clear message.
    const id = file.name.replace(/\.json$/i, '')
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      setError(`Bad filename "${file.name}" — chart id must match [a-zA-Z0-9_-].`)
      return
    }
    const text = await file.text()
    try {
      JSON.parse(text)
    } catch (err) {
      setError(`JSON parse: ${err instanceof Error ? err.message : 'invalid'}`)
      return
    }
    setUploading(true)
    const res = await fetch(`/api/admin/stories/${slug}/charts/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ raw: text }),
    })
    setUploading(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? `HTTP ${res.status}`)
      return
    }
    setCharts((prev) => (prev.includes(id) ? prev : [...prev, id].sort()))
    router.push(`/admin/${slug}/charts/${id}`)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/5 bg-neutral-900/40 shrink-0">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-xs px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
        >
          {uploading ? 'Uploading…' : '↑ Upload chart'}
        </button>
        <span className="text-xs text-neutral-600">filename → id</span>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          onChange={uploadChart}
          className="hidden"
        />
      </div>
      {error && (
        <div className="px-4 py-2 text-xs text-red-400 border-b border-white/5 shrink-0">
          {error}
        </div>
      )}
      {charts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-neutral-500 text-sm">
          No charts for this story.
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {charts.map((id) => (
            <li key={id} className="flex items-center">
              <Link
                href={`/admin/${slug}/charts/${id}`}
                className="flex-1 flex items-center justify-between px-4 py-4 active:bg-white/5 min-w-0"
              >
                <span className="font-mono text-sm truncate">{id}.json</span>
                <span className="text-neutral-500 shrink-0 ml-2">›</span>
              </Link>
              <button
                type="button"
                onClick={() => downloadChart(id)}
                className="px-3 py-4 text-sm text-neutral-400 hover:text-white hover:bg-white/5 shrink-0"
                title={`Download ${id}.json`}
              >
                ↓
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusBadge({
  status,
  dirty,
}: {
  status: { type: 'idle' | 'ok' | 'err' | 'warn'; msg?: string }
  dirty: boolean
}) {
  if (status.type === 'err') {
    return <span className="text-sm text-red-400 truncate">{status.msg}</span>
  }
  if (status.type === 'warn') {
    return <span className="text-sm text-amber-400 truncate">{status.msg}</span>
  }
  if (status.type === 'ok') {
    return <span className="text-sm text-emerald-400">{status.msg}</span>
  }
  return (
    <span className="text-sm text-neutral-500">
      {dirty ? 'Unsaved changes' : 'No changes'}
    </span>
  )
}

function SettingsPanel({
  status,
  listed,
  displayOrder,
  onChange,
}: {
  status: string
  listed: boolean
  displayOrder: number | null
  onChange: (meta: Partial<{ status: string; listed: boolean; displayOrder: number | null }>) => void
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Publishing Status</label>
          <select
            value={status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="listed"
            checked={listed}
            onChange={(e) => onChange({ listed: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="listed" className="text-sm font-medium">
            Show on home page
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Display order on home page</label>
          <input
            type="number"
            value={displayOrder ? String(displayOrder) : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
              onChange({ displayOrder: val })
            }}
            placeholder="Leave empty for unordered"
            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />
          <p className="text-xs text-neutral-500 mt-1">Lower numbers appear first (0-indexed). Leave empty to not display.</p>
        </div>
      </div>
    </div>
  )
}
