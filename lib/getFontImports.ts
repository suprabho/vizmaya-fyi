const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2'

const fontConfigs: Record<string, { family: string; weights: number[] }> = {
  'Merriweather': { family: 'Merriweather', weights: [400, 700] },
  'Lora': { family: 'Lora', weights: [400, 700] },
  'Playfair Display': { family: 'Playfair Display', weights: [400, 700] },
  'Georgia': { family: 'Georgia', weights: [] },
  'Inter': { family: 'Inter', weights: [400, 500, 600, 700] },
  'Space Mono': { family: 'Space Mono', weights: [400, 700] },
  'JetBrains Mono': { family: 'JetBrains Mono', weights: [400, 500, 600, 700] },
  'IBM Plex Mono': { family: 'IBM Plex Mono', weights: [400, 600] },
  'Courier New': { family: 'Courier New', weights: [] },
}

export function getFontImportUrl(fonts: { serif?: string; sans?: string; mono?: string }): string | null {
  const fontsToLoad: Array<{ family: string; weights: number[] }> = []

  if (fonts.serif && fonts.serif in fontConfigs) {
    fontsToLoad.push(fontConfigs[fonts.serif])
  }
  if (fonts.sans && fonts.sans in fontConfigs) {
    fontsToLoad.push(fontConfigs[fonts.sans])
  }
  if (fonts.mono && fonts.mono in fontConfigs) {
    fontsToLoad.push(fontConfigs[fonts.mono])
  }

  if (fontsToLoad.length === 0) return null

  // Deduplicate fonts by family name
  const uniqueFonts = Array.from(
    new Map(fontsToLoad.map(f => [f.family, f])).values()
  )

  // Build the family param with weights
  const families = uniqueFonts
    .filter(f => f.weights.length > 0) // Only include fonts with weights
    .map(f => {
      const weightStr = f.weights.join(';')
      return `${f.family.replace(/ /g, '+')}:wght@${weightStr}`
    })

  if (families.length === 0) return null

  const params = new URLSearchParams({
    family: families.join('&family='),
    display: 'swap',
  })

  return `${GOOGLE_FONTS_URL}?${params.toString()}`
}
