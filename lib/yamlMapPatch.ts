/**
 * Surgically update map.center/zoom/pitch/bearing inside a section's raw YAML
 * without re-serializing. Preserves comments, quoting, and every other key
 * (pins, regions, heatmap, opacity, etc.).
 *
 * The section YAML looks like:
 *   - id: hero
 *     kind: hero
 *     map:
 *       center: [10.0, 20.0]
 *       zoom: 1.7
 *       pitch: 0
 *       bearing: 0
 *       opacity: 0.45
 */

export interface MapView {
  center: [number, number]
  zoom: number
  pitch: number
  bearing: number
}

export function extractMapView(sectionRaw: string): MapView | null {
  const center = matchCenter(sectionRaw)
  const zoom = matchNum(sectionRaw, 'zoom')
  if (!center || zoom == null) return null
  return {
    center,
    zoom,
    pitch: matchNum(sectionRaw, 'pitch') ?? 0,
    bearing: matchNum(sectionRaw, 'bearing') ?? 0,
  }
}

/**
 * Return the section YAML with center/zoom/pitch/bearing updated. Only
 * touches values under `map:`. If a key isn't present in the source, it's
 * inserted at the end of the map block.
 */
export function applyMapView(sectionRaw: string, view: MapView): string {
  let next = sectionRaw

  next = replaceOrInsert(
    next,
    'center',
    `[${round(view.center[0], 4)}, ${round(view.center[1], 4)}]`
  )
  next = replaceOrInsert(next, 'zoom', round(view.zoom, 2).toString())
  next = replaceOrInsert(next, 'pitch', round(view.pitch, 1).toString())
  next = replaceOrInsert(next, 'bearing', round(view.bearing, 1).toString())

  return next
}

function matchCenter(raw: string): [number, number] | null {
  const m = raw.match(/^\s*center:\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/m)
  if (!m) return null
  return [parseFloat(m[1]), parseFloat(m[2])]
}

function matchNum(raw: string, key: string): number | null {
  const re = new RegExp(`^\\s*${key}:\\s*(-?\\d+(?:\\.\\d+)?)\\b`, 'm')
  const m = raw.match(re)
  return m ? parseFloat(m[1]) : null
}

function replaceOrInsert(raw: string, key: string, newValue: string): string {
  if (key === 'center') {
    const re = /^(\s*)center:\s*\[.*?\]\s*$/m
    if (re.test(raw)) return raw.replace(re, `$1center: ${newValue}`)
    return insertUnderMap(raw, key, newValue)
  }
  const re = new RegExp(`^(\\s*)${key}:\\s*-?\\d+(?:\\.\\d+)?\\s*$`, 'm')
  if (re.test(raw)) return raw.replace(re, `$1${key}: ${newValue}`)
  return insertUnderMap(raw, key, newValue)
}

function insertUnderMap(raw: string, key: string, value: string): string {
  // Find the line "   map:" and append a new child line after its last existing child.
  const mapIdx = raw.search(/^\s*map:\s*$/m)
  if (mapIdx < 0) return raw // no map block — nothing to update
  const lines = raw.split('\n')
  let mapLine = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*map:\s*$/.test(lines[i])) {
      mapLine = i
      break
    }
  }
  if (mapLine < 0) return raw
  const mapIndent = (lines[mapLine].match(/^(\s*)/)?.[1] ?? '').length
  const childIndent = ' '.repeat(mapIndent + 2)
  // Walk forward until a line with indent <= mapIndent (or EOF) to find end of the block.
  let insertAt = lines.length
  for (let i = mapLine + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)\S/)
    if (m && m[1].length <= mapIndent) {
      insertAt = i
      break
    }
  }
  lines.splice(insertAt, 0, `${childIndent}${key}: ${value}`)
  return lines.join('\n')
}

function round(n: number, places: number): number {
  const p = Math.pow(10, places)
  return Math.round(n * p) / p
}
