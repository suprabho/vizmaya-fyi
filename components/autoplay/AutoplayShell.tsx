'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { createBrowserClient } from '@/lib/supabase'
import ChartPanel from '@/components/story/ChartPanel'
import { HeroPanel } from '@/components/story/Hero'
import { formatInlineMarkdown } from '@/lib/formatInlineMarkdown'
import type { ResolvedUnit, StoryDefaults } from '@/lib/storyConfig.types'
import type MapboxBackgroundType from '@/components/story/charts/MapboxBackground'
import type { MapStep } from '@/components/story/charts/MapboxBackground'
import AutoplayAspectToggle, { type AutoplayRatio } from './AutoplayAspectToggle'

/* ─── Lazy-load MapboxBackground (client-only) ─────────────────────── */

type MapboxBackgroundProps = React.ComponentProps<typeof MapboxBackgroundType>

function MapboxBackground(props: MapboxBackgroundProps) {
  const [Comp, setComp] = useState<ComponentType<MapboxBackgroundProps> | null>(null)
  useEffect(() => {
    let cancelled = false
    import('@/components/story/charts/MapboxBackground').then((m) => {
      if (!cancelled) setComp(() => m.default)
    })
    return () => { cancelled = true }
  }, [])
  if (!Comp) return null
  return <Comp {...props} />
}

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
  accessToken: string
  defaults: StoryDefaults
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function extractHeroBits(paragraphs: string[]): { dek: string; byline: string } {
  const dek =
    paragraphs.find((p) => /^\*[^*]/.test(p))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  const byline =
    paragraphs.find((p) => p.startsWith('**'))?.replace(/^\*+|\*+$/g, '').trim() ?? ''
  return { dek, byline }
}

/* ─── Viewport dimensions for aspect ratios ────────────────────────── */

function getViewportStyle(ratio: AutoplayRatio): { width: string; height: string } {
  if (ratio === '9:16') {
    return { width: 'min(56.25vh, 100vw)', height: 'min(100vh, 177.78vw)' }
  }
  return { width: 'min(100vw, 177.78vh)', height: 'min(56.25vw, 100vh)' }
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function AutoplayShell({
  slug,
  title,
  units: desktopUnits,
  mobileUnits,
  accessToken,
  defaults,
}: Props) {
  const [ratio, setRatio] = useState<AutoplayRatio>('9:16')
  const [activeUnit, setActiveUnit] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Map of unit_index → public_url for available audio
  const [audioMap, setAudioMap] = useState<Map<number, string>>(new Map())

  // Use mobileUnits for 9:16 (vertical), desktop for 16:9
  const units = useMemo(
    () => (ratio === '9:16' && mobileUnits ? mobileUnits : desktopUnits),
    [ratio, mobileUnits, desktopUnits]
  )

  // Load audio records from Supabase
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('story_audio')
      .select('unit_index, public_url')
      .eq('slug', slug)
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('[Autoplay] Failed to load audio records:', error?.message)
          setAudioMap(new Map())
          return
        }
        const map = new Map<number, string>()
        for (const row of data as AudioRecord[]) {
          map.set(row.unit_index, row.public_url)
        }
        setAudioMap(map)
      })
  }, [slug])

  // Reset active unit when switching ratio
  useEffect(() => {
    setActiveUnit(0)
    stopPlayback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, units.length])

  // Build map steps (same logic as StoryMapShell)
  const isVertical = ratio === '9:16'
  const mapSteps: MapStep[] = useMemo(
    () =>
      units.map((unit) => {
        const parentMap = unit.parentConfig.map
        const sub = unit.parentConfig.subsections?.[unit.subIndex]
        const over = sub?.map

        let center = over?.center ?? parentMap.center
        let zoom = over?.zoom ?? parentMap.zoom
        let pitch = over?.pitch ?? parentMap.pitch
        let bearing = over?.bearing ?? parentMap.bearing
        let flySpeed = over?.flySpeed ?? parentMap.flySpeed ?? defaults.flySpeed
        let opacity = over?.opacity ?? parentMap.opacity ?? defaults.mapOpacity
        let pins = over?.pins ?? parentMap.pins

        if (isVertical) {
          const mob = over?.mobile ?? parentMap.mobile
          if (mob) {
            center = mob.center ?? center
            zoom = mob.zoom ?? zoom
            pitch = mob.pitch ?? pitch
            bearing = mob.bearing ?? bearing
            flySpeed = mob.flySpeed ?? flySpeed
            opacity = mob.opacity ?? opacity
            pins = mob.pins ?? pins
          }
        }

        return {
          center,
          zoom,
          pitch,
          bearing,
          flySpeed,
          opacity,
          pins: pins?.map((p) => ({
            coordinates: p.coordinates,
            label: p.label,
            color: p.color ?? defaults.pinColor,
            radius: p.radius ?? defaults.pinRadius,
            pulse: p.pulse,
          })),
        }
      }),
    [units, isVertical, defaults]
  )

  const current = units[activeUnit] ?? units[0]
  const activeSub = current?.subIndex ?? 0
  const currentChartId = current?.parentConfig.chart

  /* ─── Audio (static file playback) ────────────────────────────── */

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const playUnit = useCallback(
    (unitIndex: number) => {
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      setActiveUnit(unitIndex)

      const audioUrl = audioMap.get(unitIndex)

      if (!audioUrl) {
        // No audio for this unit — wait then advance
        setTimeout(() => {
          if (unitIndex < units.length - 1) {
            playUnit(unitIndex + 1)
          } else {
            setIsPlaying(false)
          }
        }, 4000)
        return
      }

      setAudioLoading(true)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.oncanplaythrough = () => setAudioLoading(false)

      audio.onended = () => {
        if (unitIndex < units.length - 1) {
          setTimeout(() => playUnit(unitIndex + 1), 800)
        } else {
          setIsPlaying(false)
        }
      }

      audio.onerror = () => {
        setAudioLoading(false)
        if (unitIndex < units.length - 1) {
          setTimeout(() => playUnit(unitIndex + 1), 3000)
        } else {
          setIsPlaying(false)
        }
      }

      audio.play().catch(() => {
        setAudioLoading(false)
        if (unitIndex < units.length - 1) {
          setTimeout(() => playUnit(unitIndex + 1), 4000)
        } else {
          setIsPlaying(false)
        }
      })
    },
    [audioMap, units.length]
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

  const viewportStyle = getViewportStyle(ratio)
  const kind = current?.parentConfig.kind ?? 'text'
  const heroBits = kind === 'hero' ? extractHeroBits(current.paragraphs) : null
  const hasAudioForCurrent = audioMap.has(activeUnit)
  const totalAudioCount = audioMap.size

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b"
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
                ? `${totalAudioCount}/${units.length} audio tracks`
                : 'no audio generated'}
            </div>
          </div>
        </div>
      </div>

      {/* Viewport container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative overflow-hidden rounded-xl"
          style={{
            width: viewportStyle.width,
            height: viewportStyle.height,
            border: '1px solid var(--color-line, #1a2830)',
            background: 'var(--color-bg)',
          }}
        >
          {/* Map background */}
          <div className="absolute inset-0 z-0">
            <MapboxBackground
              accessToken={accessToken}
              steps={mapSteps}
              activeStep={activeUnit}
              style={defaults.mapStyle}
              defaultPinColor={defaults.pinColor}
              defaultPinRadius={defaults.pinRadius}
              defaultOpacity={defaults.mapOpacity}
              highlightCountry={defaults.highlightCountry}
              highlightColor={defaults.highlightColor}
            />
          </div>

          {/* Chart panel */}
          {currentChartId && (
            <div
              className="absolute z-10 pointer-events-none flex items-center justify-center"
              style={
                isVertical
                  ? {
                      top: '5%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 'calc(100% - 1.5rem)',
                      aspectRatio: '1',
                      maxHeight: '40%',
                    }
                  : {
                      top: 0,
                      right: 0,
                      width: '55%',
                      height: '55%',
                    }
              }
            >
              <div
                className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center p-2"
                style={{
                  background: 'rgba(10, 14, 20, 0.2)',
                  border: '0.5px solid var(--color-line, #1a2830)',
                }}
              >
                <ChartPanel
                  key={currentChartId}
                  chartId={currentChartId}
                  activeStep={activeSub}
                />
              </div>
            </div>
          )}

          {/* Text overlay */}
          <div
            className="absolute z-20 overflow-y-auto"
            style={
              isVertical
                ? {
                    bottom: '6rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 1.5rem)',
                    maxHeight: currentChartId ? '45%' : '70%',
                  }
                : {
                    bottom: '4rem',
                    right: '1rem',
                    width: '50%',
                    maxHeight: currentChartId ? '40%' : '80%',
                  }
            }
          >
            <div
              className="rounded-lg p-4 backdrop-blur-sm"
              style={{
                background: 'rgba(10, 14, 20, 0.35)',
                border: '0.5px solid var(--color-line, #1a2830)',
              }}
            >
              {kind === 'hero' && current.heading ? (
                <div className="scale-[0.75] origin-top-left">
                  <HeroPanel
                    title={current.heading}
                    dek={heroBits?.dek ?? ''}
                    byline={heroBits?.byline ?? ''}
                    eyebrow={current.parentConfig.eyebrow}
                  />
                </div>
              ) : kind === 'stat' && current.heading ? (
                <div className="flex flex-col items-center text-center py-2">
                  <div
                    className="font-[family-name:var(--font-serif)] text-[clamp(2rem,8vw,5rem)] font-bold leading-none mb-2"
                    style={{
                      color: current.heading.includes('%')
                        ? 'var(--color-red, #E24B4A)'
                        : 'var(--color-accent2)',
                    }}
                  >
                    {current.heading}
                  </div>
                  <div
                    className="font-[family-name:var(--font-sans)] text-[0.8rem] max-w-[340px] leading-[1.5]"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {current.paragraphs.join(' ')}
                  </div>
                </div>
              ) : (
                <>
                  {current.heading && (
                    <div
                      className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.15em] mb-2"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {current.heading}
                    </div>
                  )}
                  {current.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="font-[family-name:var(--font-serif)] text-[0.85rem] leading-[1.6] mb-2 last:mb-0"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {formatInlineMarkdown(p)}
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <div className="flex gap-0.5 px-3 pb-2">
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
                      i === activeUnit
                        ? 'var(--color-accent)'
                        : i < activeUnit
                          ? 'var(--color-accent)'
                          : 'rgba(255,255,255,0.2)',
                    opacity: i <= activeUnit ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Audio loading indicator */}
          {audioLoading && (
            <div className="absolute top-3 right-3 z-30">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div
        className="sticky bottom-0 z-50 border-t backdrop-blur-md"
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full transition-colors"
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
