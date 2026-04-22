import type mapboxgl from 'mapbox-gl'
import type { MapPalette } from './storyConfig.types'

/**
 * Walk the active style's layers and rewrite paint properties so the map
 * matches a per-story palette. Operates on whatever Mapbox style is loaded —
 * built for `mapbox://styles/mapbox/dark-v11` but the id matching is permissive
 * enough to cover Light v11, Streets v12, etc.
 *
 * Set-paint-property replaces any existing value, including zoom-based
 * `interpolate` expressions. That's fine for a brand restyle: the whole point
 * is to flatten the label/land/water colors to the story palette. If a story
 * later needs zoom-varying brand colors, pass an expression as the palette
 * value — Mapbox accepts it.
 *
 * Call this inside the map's `load` event. Calling before load throws
 * "Style is not done loading".
 */
export function applyMapPalette(map: mapboxgl.Map, palette: MapPalette): void {
  const style = map.getStyle()
  const layers = style?.layers ?? []

  for (const layer of layers) {
    const id = layer.id
    const type = layer.type

    // Base (land/background). `background` layers carry background-color;
    // some styles also include a plain `land` fill layer.
    if (palette.land) {
      if (type === 'background') {
        map.setPaintProperty(id, 'background-color', palette.land)
      } else if (type === 'fill' && (id === 'land' || id === 'landcover' || id.startsWith('land-'))) {
        map.setPaintProperty(id, 'fill-color', palette.land)
      }
    }

    // Water fills. dark-v11 splits into `water` + `water-shadow` + `waterway`
    // layers; match on id prefix so all of them pick up the new color.
    if (palette.water && type === 'fill' && (id === 'water' || id.startsWith('water') || id.startsWith('waterway'))) {
      map.setPaintProperty(id, 'fill-color', palette.water)
    }

    // Borders — country + state lines. Skip `*-disputed` so disputed
    // boundaries still render as dashed in the base style's own color.
    if (palette.border && type === 'line' && id.includes('admin-') && id.includes('-boundary')) {
      map.setPaintProperty(id, 'line-color', palette.border)
    }

    // Roads. Restrict to line layers whose id starts with a known road prefix,
    // and explicitly skip label layers (those are handled by labelText below).
    if (palette.road && type === 'line' && !id.includes('label')) {
      if (id.startsWith('road') || id.startsWith('tunnel') || id.startsWith('bridge')) {
        map.setPaintProperty(id, 'line-color', palette.road)
      }
    }

    // Buildings (2D fill + 3D extrusion fills).
    if (palette.building && id.includes('building')) {
      if (type === 'fill') map.setPaintProperty(id, 'fill-color', palette.building)
      else if (type === 'fill-extrusion') map.setPaintProperty(id, 'fill-extrusion-color', palette.building)
    }

    // Symbol labels — text color + halo for every layer that renders text.
    if (type === 'symbol') {
      const layout = (layer.layout ?? {}) as { 'text-field'?: unknown }
      if (layout['text-field'] != null) {
        if (palette.labelText) {
          map.setPaintProperty(id, 'text-color', palette.labelText)
        }
        if (palette.labelHalo) {
          map.setPaintProperty(id, 'text-halo-color', palette.labelHalo)
        }
      }
    }
  }
}

/**
 * Apply a custom Mapbox fontstack to every text layer. The fontstack must
 * reference fonts served by the style's `glyphs:` URL — typically custom
 * fonts uploaded to your Mapbox Studio account (e.g. a Vizmaya brand font).
 *
 * Passing a fontstack whose glyphs aren't available silently falls back to
 * the first font Mapbox can resolve, so test on a map that actually loads
 * from your tenant before relying on it.
 */
export function applyMapFontstack(map: mapboxgl.Map, fontstack: string[]): void {
  if (fontstack.length === 0) return
  const layers = map.getStyle()?.layers ?? []
  for (const layer of layers) {
    if (layer.type !== 'symbol') continue
    const layout = (layer.layout ?? {}) as { 'text-field'?: unknown }
    if (layout['text-field'] == null) continue
    map.setLayoutProperty(layer.id, 'text-font', fontstack)
  }
}
