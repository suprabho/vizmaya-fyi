'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { ResolvedUnit, StoryDefaults } from '@/lib/storyConfig.types'
import AutoplayAspectToggle, { type AutoplayRatio } from './AutoplayAspectToggle'

/* ─── Audio record from Supabase ───────────────────────────────────── */

interface AudioRecord {
  unit_index: number
  public_url: string
}

/* ─── Props ────────────────────────────────────────────────────────── */

interface Props {
  slug: string
  title: string
  units: ResolvedUnit[]
  mobileUnits?: ResolvedUnit[]
  /**
   * For each desktop unit (index = position in `units`), the array of mobile
   * unit indices it expands into. Audio is generated per mobile unit; for
   * desktop playback we queue these segments back-to-back.
   */
  desktopToMobile: number[][]
  accessToken: string
  defaults: StoryDefaults
}

/* ─── Fixed viewport dimensions per ratio ──────────────────────────── */

/**
 * Real pixel dimensions used for the iframe. The story page renders at these
 * dimensions so its `[@media(min-aspect-ratio:1/1)]` queries resolve based on
 * the iframe viewport (not the parent window). The whole iframe is then
 * CSS-scaled with `transform: scale()` to fit the available screen height.
 */
const VIEWPORT_DIMS: Record<AutoplayRatio, { width: number; height: number }> = {
  '9:16': { width: 414, height: 736 }, // mobile portrait — true 9:16
  '16:9': { width: 1280, height: 720 }, // widescreen — true 16:9
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function AutoplayShell({
  slug,
  units: desktopUnits,
  mobileUnits,
  desktopToMobile,
}: Props) {
  const [ratio, setRatio] = useState<AutoplayRatio>('9:16')
  const [activeUnit, setActiveUnit] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [scale, setScale] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // Map of unit_index → public_url for available audio
  const [audioMap, setAudioMap] = useState<Map<number, string>>(new Map())

  // Use mobileUnits for 9:16 (vertical), desktop for 16:9
  const isVertical = ratio === '9:16'
  const units = useMemo(
    () => (isVertical && mobileUnits ? mobileUnits : desktopUnits),
    [isVertical, mobileUnits, desktopUnits]
  )

  /**
   * For the current display orientation, the list of mobile-unit audio indices
   * that back each visible unit. In 9:16 mode each visible unit IS a mobile
   * unit, so the mapping is identity. In 16:9 (desktop) mode each visible unit
   * may map to multiple mobile audio segments which play back-to-back.
   */
  const audioIndicesPerUnit = useMemo<number[][]>(() => {
    if (isVertical) {
      // Identity: each mobile unit's audio key = its own index
      return units.map((_, i) => [i])
    }
    return desktopToMobile
  }, [isVertical, units, desktopToMobile])

  const dims = VIEWPORT_DIMS[ratio]
  const scaledWidth = dims.width * scale
  const scaledHeight = dims.height * scale

  /* ─── Compute scale to fit available stage area ──────────────── */

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const compute = () => {
      const rect = stage.getBoundingClientRect()
      const availW = rect.width
      const availH = rect.height
      if (availW <= 0 || availH <= 0) return
      const s = Math.min(availW / dims.width, availH / dims.height)
      setScale(s)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(stage)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [dims.width, dims.height])

  /* ─── Load audio records from Supabase ───────────────────────── */

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('story_audio')
      .select('unit_index, public_url')
      .eq('slug', slug)
      .then((res: { data: AudioRecord[] | null; error: { message: string } | null }) => {
        const { data, error } = res
        if (error || !data) {
          console.error('[Autoplay] Failed to load audio records:', error?.message)
          setAudioMap(new Map())
          return
        }
        const map = new Map<number, string>()
        for (const row of data) {
          map.set(row.unit_index, row.public_url)
        }
        setAudioMap(map)
      })
  }, [slug])

  /* ─── Iframe scroll control ──────────────────────────────────── */

  /**
   * Scroll the iframe's snap-scroll container to the section with the given
   * `data-unit-index`. Same-origin so we can reach into contentDocument.
   */
  const scrollIframeToUnit = useCallback((unitIndex: number) => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    const target = doc.querySelector<HTMLElement>(
      `[data-unit-index="${unitIndex}"]`
    )
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // When iframe finishes loading, jump to the active unit (no smooth on init).
  const handleIframeLoad = useCallback(() => {
    setIframeReady(true)
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    const target = doc.querySelector<HTMLElement>(
      `[data-unit-index="${activeUnit}"]`
    )
    if (target) target.scrollIntoView({ block: 'start' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync iframe scroll when activeUnit changes (after the iframe has loaded).
  useEffect(() => {
    if (!iframeReady) return
    scrollIframeToUnit(activeUnit)
  }, [activeUnit, iframeReady, scrollIframeToUnit])

  // When ratio changes, the iframe reloads (different key) — reset state.
  useEffect(() => {
    setActiveUnit(0)
    setIframeReady(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [ratio])

  /* ─── Audio playback ─────────────────────────────────────────── */

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  /**
   * Play one mobile-audio segment, then call `onComplete` so the caller can
   * decide whether to chain to the next segment within the same unit, advance
   * to the next unit, or stop. Returns nothing — control flows through
   * `onComplete` so cancellation (via stopPlayback) is straightforward.
   */
  const playSegment = useCallback(
    (audioIndex: number, onComplete: () => void, onSkip: () => void) => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audioUrl = audioMap.get(audioIndex)
      if (!audioUrl) {
        // No audio for this segment — wait briefly then skip
        setTimeout(onSkip, 2000)
        return
      }

      setAudioLoading(true)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.oncanplaythrough = () => setAudioLoading(false)
      audio.onended = onComplete
      audio.onerror = () => {
        setAudioLoading(false)
        onSkip()
      }
      audio.play().catch(() => {
        setAudioLoading(false)
        onSkip()
      })
    },
    [audioMap]
  )

  /**
   * Play a desktop unit by queueing each of its mobile-audio segments
   * back-to-back. When all segments finish, advance to the next unit (unless
   * stopped). Each segment gets a small inter-segment pause; each unit gets a
   * slightly longer pause before moving on.
   */
  const playUnit = useCallback(
    (unitIndex: number) => {
      setActiveUnit(unitIndex)

      const audioIndices = audioIndicesPerUnit[unitIndex] ?? []

      const advanceToNextUnit = () => {
        if (unitIndex < units.length - 1) {
          setTimeout(() => playUnit(unitIndex + 1), 800)
        } else {
          setIsPlaying(false)
        }
      }

      // No audio segments at all — wait and advance
      if (audioIndices.length === 0) {
        setTimeout(advanceToNextUnit, 4000)
        return
      }

      let segmentPos = 0
      const playNextSegment = () => {
        if (segmentPos >= audioIndices.length) {
          advanceToNextUnit()
          return
        }
        const currentAudioIndex = audioIndices[segmentPos]
        segmentPos++
        playSegment(
          currentAudioIndex,
          // onComplete: small pause, then next segment within same unit
          () => setTimeout(playNextSegment, 250),
          // onSkip: also try next segment
          playNextSegment
        )
      }

      playNextSegment()
    },
    [audioIndicesPerUnit, playSegment, units.length]
  )

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopPlayback()
    } else {
      setIsPlaying(true)
      playUnit(activeUnit)
    }
  }, [isPlaying, stopPlayback, playUnit, activeUnit])

  const handlePrev = useCallback(() => {
    stopPlayback()
    setActiveUnit((prev) => Math.max(0, prev - 1))
  }, [stopPlayback])

  const handleNext = useCallback(() => {
    stopPlayback()
    setActiveUnit((prev) => Math.min(units.length - 1, prev + 1))
  }, [stopPlayback, units.length])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  /* ─── Render ───────────────────────────────────────────────────── */

  // Total = mobile-grain segments stored in DB
  const totalAudioCount = audioMap.size
  // For the current visible unit, "ready" means at least one of its
  // backing mobile audio segments is in the cache.
  const hasAudioForCurrent = (audioIndicesPerUnit[activeUnit] ?? []).some((i) =>
    audioMap.has(i)
  )

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <div
        className="shrink-0 backdrop-blur-md border-b z-50"
        style={{
          borderColor: 'var(--color-surface)',
          background: 'rgba(5,47,74,0.85)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <a
              href={`/story/${slug}`}
              className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text)' }}
            >
              &larr; Story
            </a>
            <h1
              className="font-[family-name:var(--font-serif)] text-lg font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Autoplay
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <AutoplayAspectToggle value={ratio} onChange={setRatio} />
            <div
              className="px-3 py-1.5 rounded-md font-[family-name:var(--font-mono)] text-[0.65rem] tracking-wider"
              style={{ color: 'var(--color-muted)' }}
            >
              {totalAudioCount > 0
                ? `${totalAudioCount} audio segments`
                : 'no audio generated'}
            </div>
          </div>
        </div>
      </div>

      {/* Stage — fills remaining vertical space; iframe is scaled to fit. */}
      <div
        ref={stageRef}
        className="flex-1 min-h-0 flex items-center justify-center p-4"
      >
        <div
          className="relative"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/* Scaled wrapper that holds the real-pixel iframe. */}
          <div
            className="absolute top-0 left-0 overflow-hidden rounded-xl"
            style={{
              width: dims.width,
              height: dims.height,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              border: '1px solid var(--color-line, #1a2830)',
              background: 'var(--color-bg)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <iframe
              key={ratio /* force reload when ratio changes */}
              ref={iframeRef}
              src={`/story/${slug}`}
              onLoad={handleIframeLoad}
              title="Autoplay preview"
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                pointerEvents: 'none', // Block direct interaction; controls live in parent
                display: 'block',
              }}
            />
          </div>

          {/* Progress dots — sit just below the scaled frame */}
          <div
            className="absolute left-0 right-0 flex gap-0.5"
            style={{ bottom: -14 }}
          >
            {units.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  stopPlayback()
                  setActiveUnit(i)
                }}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    i <= activeUnit
                      ? 'var(--color-accent)'
                      : 'rgba(255,255,255,0.2)',
                  opacity: i <= activeUnit ? 1 : 0.5,
                }}
                aria-label={`Jump to section ${i + 1}`}
              />
            ))}
          </div>

          {/* Loading overlay while iframe initializes */}
          {!iframeReady && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(5,47,74,0.6)' }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: 'var(--color-accent)',
                  borderTopColor: 'transparent',
                }}
              />
            </div>
          )}

          {/* Audio loading indicator (top-right corner of frame) */}
          {audioLoading && iframeReady && (
            <div
              className="absolute z-30"
              style={{ top: 8, right: 8 }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: 'var(--color-accent)',
                  borderTopColor: 'transparent',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div
        className="shrink-0 border-t backdrop-blur-md z-50"
        style={{
          borderColor: 'var(--color-surface)',
          background: 'rgba(5,47,74,0.9)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Section counter */}
          <div
            className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-wider"
            style={{ color: 'var(--color-muted)' }}
          >
            {activeUnit + 1} / {units.length}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={activeUnit === 0}
              className="p-2 rounded-lg transition-opacity disabled:opacity-30 hover:opacity-80"
              style={{ color: 'var(--color-text)' }}
              aria-label="Previous section"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!iframeReady}
              className="p-3 rounded-full transition-colors disabled:opacity-50"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={activeUnit === units.length - 1}
              className="p-2 rounded-lg transition-opacity disabled:opacity-30 hover:opacity-80"
              style={{ color: 'var(--color-text)' }}
              aria-label="Next section"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Audio status */}
          <div
            className="font-[family-name:var(--font-mono)] text-[0.65rem] tracking-wider"
            style={{ color: 'var(--color-muted)' }}
          >
            {hasAudioForCurrent ? (
              <span style={{ color: 'var(--color-accent)' }}>audio ready</span>
            ) : audioLoading ? (
              'loading...'
            ) : (
              'no audio'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
