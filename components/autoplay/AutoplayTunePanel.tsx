'use client'

interface CueRecord {
  unit_index: number
  chunk_index: number
  start_ms: number
  end_ms: number
}

interface Props {
  /** The currently visible unit (post desktop→mobile mapping for 16:9). */
  activeUnit: number
  /** The mobile-cue index this visible unit is bound to, or undefined. */
  mobileIdx: number | undefined
  /** The base cues from DB (without overrides applied). */
  baseCues: CueRecord[]
  /** Local override map. */
  overrides: Map<number, CueRecord>
  /** Number of unsaved overrides. */
  dirtyCount: number
  saving: boolean
  saveError: string | null
  onSave: () => void
  onReset: () => void
}

/**
 * Floating panel for fine-tuning cue boundaries during playback. Keyboard
 * `[` `]` shifts the boundary by 100ms (Shift for 25ms). The panel itself
 * doesn't own the nudge behaviour — `AutoplayShell` does — it only displays
 * the active cue's timing and exposes save/reset.
 */
export default function AutoplayTunePanel({
  activeUnit,
  mobileIdx,
  baseCues,
  overrides,
  dirtyCount,
  saving,
  saveError,
  onSave,
  onReset,
}: Props) {
  const base = mobileIdx !== undefined ? baseCues.find((c) => c.unit_index === mobileIdx) : undefined
  const live = mobileIdx !== undefined ? overrides.get(mobileIdx) : undefined
  const cur = live ?? base
  const delta = base && live ? live.start_ms - base.start_ms : 0

  return (
    <div
      className="fixed left-4 bottom-20 z-40 rounded-md border backdrop-blur-md font-[family-name:var(--font-mono)]"
      style={{
        background: 'rgba(5,47,74,0.92)',
        borderColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        minWidth: 260,
      }}
    >
      <div
        className="px-3 py-2 border-b text-[0.6rem] uppercase tracking-wider opacity-80"
        style={{ borderColor: 'var(--color-surface)' }}
      >
        Tune cues
      </div>

      <div className="px-3 py-2 text-[0.7rem] leading-relaxed">
        <div className="flex justify-between">
          <span className="opacity-60">visible unit</span>
          <span>{activeUnit + 1}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-60">cue index</span>
          <span>{mobileIdx ?? '—'}</span>
        </div>
        {cur ? (
          <>
            <div className="flex justify-between">
              <span className="opacity-60">chunk</span>
              <span>{cur.chunk_index}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">start</span>
              <span>
                {(cur.start_ms / 1000).toFixed(2)}s
                {delta !== 0 && (
                  <span
                    className="ml-2"
                    style={{ color: delta > 0 ? 'var(--color-accent)' : '#ff6b6b' }}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta}ms
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">end</span>
              <span>{(cur.end_ms / 1000).toFixed(2)}s</span>
            </div>
          </>
        ) : (
          <div className="opacity-60">no cue at this unit</div>
        )}
      </div>

      <div
        className="px-3 py-2 border-t text-[0.6rem] opacity-70 leading-relaxed"
        style={{ borderColor: 'var(--color-surface)' }}
      >
        <div>
          <kbd className="opacity-100">[</kbd> /{' '}
          <kbd className="opacity-100">]</kbd> shift ±100ms
        </div>
        <div>
          <kbd>shift</kbd> + key for ±25ms
        </div>
        <div>
          <kbd>esc</kbd> exits ·{' '}
          <kbd>{navigator?.platform?.startsWith('Mac') ? '⌘' : 'ctrl'}+s</kbd>{' '}
          saves
        </div>
      </div>

      {saveError && (
        <div className="px-3 py-2 text-[0.65rem]" style={{ color: '#ff6b6b' }}>
          {saveError}
        </div>
      )}

      <div
        className="px-3 py-2 border-t flex items-center justify-end gap-2"
        style={{ borderColor: 'var(--color-surface)' }}
      >
        <button
          onClick={onReset}
          disabled={dirtyCount === 0 || saving}
          className="px-3 py-1 rounded text-[0.65rem] uppercase tracking-wider transition-opacity disabled:opacity-30"
          style={{ color: 'var(--color-text)' }}
        >
          Reset
        </button>
        <button
          onClick={onSave}
          disabled={dirtyCount === 0 || saving}
          className="px-3 py-1 rounded text-[0.65rem] uppercase tracking-wider transition-opacity disabled:opacity-40"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          {saving ? 'Saving…' : `Save${dirtyCount > 0 ? ` ${dirtyCount}` : ''}`}
        </button>
      </div>
    </div>
  )
}
