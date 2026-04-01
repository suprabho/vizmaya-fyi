import {
  Block,
  HeroBlock,
  StatBlock,
  ActHeaderBlock,
  DividerBlock,
  ProseBlock,
  SubsectionHeaderBlock,
  DataTableBlock,
  ExposureGridBlock,
  ScrollySectionBlock,
  TakeawayGridBlock,
  MethodologyBlock,
  FooterBlock,
  ScenarioToggleBlock,
} from '@/types/story'

export function parseMarkdown(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let i = 0

  // First block: hero (# heading + italic + bold byline)
  if (lines[i]?.startsWith('# ')) {
    const hero = parseHero(lines, i)
    blocks.push(hero.block)
    i = hero.nextIndex
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) {
      i++
      continue
    }

    // Divider: ---
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: 'divider' } as DividerBlock)
      i++
      continue
    }

    // Act header: ## Act I: / ## Act II: etc.
    if (/^## Act [IVXLC]+[:\s]/i.test(trimmed)) {
      const actMatch = trimmed.match(/^## (Act [IVXLC]+)[:\s]*(.*)$/i)
      if (actMatch) {
        blocks.push({
          type: 'act-header',
          actNumber: actMatch[1],
          title: actMatch[2].trim(),
        } as ActHeaderBlock)
      }
      i++
      continue
    }

    // Stat block: ## XX% or ## NUMBER (short heading = a stat)
    if (/^## \d/.test(trimmed)) {
      const value = trimmed.replace('## ', '')
      const stat = parseStatBlock(lines, i, value)
      blocks.push(stat.block)
      i = stat.nextIndex
      continue
    }

    // "What to watch" section -> takeaway grid
    if (/^## What to watch/i.test(trimmed)) {
      const takeaway = parseTakeawayGrid(lines, i)
      blocks.push(takeaway.block)
      i = takeaway.nextIndex
      continue
    }

    // Methodology / Sources
    if (/^## (Methodology|Sources)/i.test(trimmed)) {
      const meth = parseMethodology(lines, i)
      blocks.push(meth.block)
      i = meth.nextIndex
      continue
    }

    // Other ## headings — check for subsections with dense prose (scrolly candidates)
    if (/^## /.test(trimmed)) {
      // Regular h2 — treat as subsection header for now
      blocks.push({
        type: 'subsection-header',
        title: trimmed.replace('## ', ''),
      } as SubsectionHeaderBlock)
      i++
      continue
    }

    // ### headings — check if we have a group (scrolly) or exposure grid
    if (/^### /.test(trimmed)) {
      // Check if this is "The triple exposure" pattern
      const exposureResult = tryParseExposureGrid(lines, i)
      if (exposureResult) {
        blocks.push(exposureResult.block)
        i = exposureResult.nextIndex
        continue
      }

      // Check for consecutive ### sections -> scrolly section
      const scrollyResult = tryParseScrollySection(lines, i)
      if (scrollyResult) {
        blocks.push(scrollyResult.block)
        i = scrollyResult.nextIndex
        continue
      }

      // Single subsection
      blocks.push({
        type: 'subsection-header',
        title: trimmed.replace('### ', ''),
      } as SubsectionHeaderBlock)
      i++
      continue
    }

    // Data table: | col | col |
    if (trimmed.startsWith('|')) {
      const table = parseTable(lines, i)
      blocks.push(table.block)
      i = table.nextIndex
      continue
    }

    // Footer: *italic at end*
    if (/^\*[^*]+\*$/.test(trimmed) && i > lines.length - 10) {
      blocks.push({ type: 'footer', text: trimmed.replace(/^\*|\*$/g, '') } as FooterBlock)
      i++
      continue
    }

    // Prose paragraphs
    const prose = parseProse(lines, i)
    if (prose.block.paragraphs.length > 0) {
      blocks.push(prose.block)
      i = prose.nextIndex
    } else {
      i++
    }
  }

  // Post-process: group consecutive scenario tables into ScenarioToggle
  const withToggles = postProcessScenarioToggles(blocks)

  // Post-process: assign chartId to scrolly sections based on preceding Act header
  return assignChartIds(withToggles)
}

function parseHero(
  lines: string[],
  start: number
): { block: HeroBlock; nextIndex: number } {
  let i = start
  const title = lines[i].replace('# ', '')
  i++

  let dek = ''
  let byline = ''

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) {
      i++
      continue
    }
    if (/^\*[^*]+\*$/.test(trimmed)) {
      dek = trimmed.replace(/^\*|\*$/g, '')
      i++
      continue
    }
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      byline = trimmed.replace(/^\*\*|\*\*$/g, '')
      i++
      continue
    }
    break
  }

  return {
    block: { type: 'hero', title, dek, byline },
    nextIndex: i,
  }
}

function parseStatBlock(
  lines: string[],
  start: number,
  value: string
): { block: StatBlock; nextIndex: number } {
  let i = start + 1
  const descParagraphs: string[] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) {
      i++
      if (i < lines.length && lines[i].trim() === '') continue
      if (i < lines.length && (lines[i].trim().startsWith('#') || lines[i].trim().startsWith('---'))) break
      if (descParagraphs.length > 0) break
      continue
    }
    if (trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('|')) break
    descParagraphs.push(trimmed)
    i++
  }

  return {
    block: {
      type: 'stat-block',
      value,
      description: descParagraphs.join(' '),
    },
    nextIndex: i,
  }
}

function parseTakeawayGrid(
  lines: string[],
  start: number
): { block: TakeawayGridBlock; nextIndex: number } {
  let i = start + 1
  const items: { audience: string; content: string }[] = []
  let currentAudience = ''
  let currentContent: string[] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('---') || trimmed.startsWith('## ')) break
    if (!trimmed) {
      i++
      continue
    }

    const audienceMatch = trimmed.match(/^\*\*For ([^*]+)[:]*\*\*[:\s]*(.*)$/)
    if (audienceMatch) {
      if (currentAudience) {
        items.push({ audience: currentAudience, content: currentContent.join(' ') })
      }
      currentAudience = audienceMatch[1].replace(/:$/, '')
      currentContent = audienceMatch[2] ? [audienceMatch[2]] : []
    } else if (currentAudience) {
      currentContent.push(trimmed)
    }
    i++
  }

  if (currentAudience) {
    items.push({ audience: currentAudience, content: currentContent.join(' ') })
  }

  return {
    block: { type: 'takeaway-grid', items },
    nextIndex: i,
  }
}

function parseMethodology(
  lines: string[],
  start: number
): { block: MethodologyBlock; nextIndex: number } {
  let i = start + 1
  const content: string[] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('## ') || (trimmed.startsWith('---') && content.length > 0)) break
    if (!trimmed) {
      i++
      continue
    }
    content.push(trimmed)
    i++
  }

  return {
    block: { type: 'methodology', content },
    nextIndex: i,
  }
}

function tryParseExposureGrid(
  lines: string[],
  start: number
): { block: ExposureGridBlock; nextIndex: number } | null {
  const titleLine = lines[start].trim()
  if (!titleLine.includes('exposure') && !titleLine.includes('triple')) return null

  let i = start + 1
  const items: ExposureGridBlock['items'] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('## ') || trimmed.startsWith('---')) break
    if (trimmed.startsWith('### ')) break

    // Pattern: **Label: Value** description
    const match = trimmed.match(/^\*\*([^:]+):\s*([^*]+)\*\*\s*(.*)$/)
    if (match) {
      let desc = match[3]
      i++
      // Collect following lines as part of description
      while (i < lines.length) {
        const next = lines[i].trim()
        if (!next || next.startsWith('**') || next.startsWith('#') || next.startsWith('---')) break
        desc += ' ' + next
        i++
      }
      items.push({
        label: match[1].trim(),
        value: match[2].trim(),
        description: desc.trim(),
      })
      continue
    }

    i++
  }

  if (items.length === 0) return null
  return { block: { type: 'exposure-grid', items }, nextIndex: i }
}

function tryParseScrollySection(
  lines: string[],
  start: number
): { block: ScrollySectionBlock; nextIndex: number } | null {
  let i = start
  const steps: ScrollySectionBlock['steps'] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('## ') || trimmed === '---') break

    if (trimmed.startsWith('### ')) {
      const label = trimmed.replace('### ', '')
      i++
      const contentLines: string[] = []
      while (i < lines.length) {
        const next = lines[i].trim()
        if (next.startsWith('#') || next === '---') break
        if (next) contentLines.push(next)
        i++
      }
      steps.push({ label, content: contentLines.join('\n\n') })
    } else {
      i++
    }
  }

  if (steps.length < 2) return null
  return { block: { type: 'scrolly-section', steps }, nextIndex: i }
}

function parseTable(
  lines: string[],
  start: number
): { block: DataTableBlock; nextIndex: number } {
  let i = start
  const tableLines: string[] = []

  while (i < lines.length && lines[i].trim().startsWith('|')) {
    tableLines.push(lines[i].trim())
    i++
  }

  // Check for scenario label preceding the table
  let scenarioLabel = ''
  if (start > 0) {
    const prev = lines[start - 1]?.trim()
    if (prev && /^\*\*[^*]+\*\*$/.test(prev)) {
      // Not a scenario label if too long
    }
    const prevPrev = lines[start - 2]?.trim()
    if (prevPrev && !prevPrev.startsWith('|') && !prevPrev.startsWith('#') && !prevPrev.startsWith('---')) {
      // Check if it has a pattern like "60-day resolution:" or "**60-day..."
      const labelMatch = prevPrev.match(/^\*\*([^*]+)\*\*/)
      if (labelMatch) {
        scenarioLabel = labelMatch[1].replace(/[.:]+$/, '').trim()
      }
    }
  }

  const headers = parseTableRow(tableLines[0])
  // Skip separator row (|---|---|)
  const dataRows = tableLines
    .slice(2)
    .map(parseTableRow)
    .filter((r) => r.length > 0)

  return {
    block: {
      type: 'data-table',
      headers,
      rows: dataRows,
      ...(scenarioLabel ? { scenarioLabel } : {}),
    },
    nextIndex: i,
  }
}

function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell && !/^-+$/.test(cell))
}

function parseProse(
  lines: string[],
  start: number
): { block: ProseBlock; nextIndex: number } {
  let i = start
  const paragraphs: string[] = []

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('---') ||
      trimmed.startsWith('|')
    )
      break
    if (!trimmed) {
      i++
      continue
    }
    // Don't capture bold-only lines that look like scenario labels
    if (/^\*\*[^*]+:\s/.test(trimmed) && i + 1 < lines.length && lines[i + 1]?.trim().startsWith('|')) {
      break
    }
    paragraphs.push(trimmed)
    i++
  }

  return {
    block: { type: 'prose', paragraphs },
    nextIndex: i,
  }
}

const ACT_CHART_MAP: Record<string, string> = {
  'Act I': 'korea-bar',
  'Act II': 'helium-price',
  'Act III': 'feedback-loop',
  'Act IV': 'dram-price',
}

function assignChartIds(blocks: Block[]): Block[] {
  let currentAct = ''
  return blocks.map((block) => {
    if (block.type === 'act-header') {
      currentAct = block.actNumber
    }
    if (block.type === 'scrolly-section' && currentAct && ACT_CHART_MAP[currentAct]) {
      return { ...block, chartId: ACT_CHART_MAP[currentAct] }
    }
    return block
  })
}

function postProcessScenarioToggles(blocks: Block[]): Block[] {
  const result: Block[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    // Look for consecutive data-table blocks with scenario labels
    if (block.type === 'data-table' && block.scenarioLabel) {
      const scenarios: ScenarioToggleBlock['scenarios'] = []
      while (i < blocks.length) {
        const current = blocks[i]
        if (current.type === 'data-table' && current.scenarioLabel) {
          scenarios.push({ label: current.scenarioLabel, table: current })
          i++
          // Skip any prose blocks between scenario tables
          while (i < blocks.length && blocks[i].type === 'prose') {
            const nextTable = blocks.slice(i + 1).find((b) => b.type === 'data-table')
            if (nextTable && nextTable.type === 'data-table' && nextTable.scenarioLabel) {
              i++
            } else {
              break
            }
          }
        } else {
          break
        }
      }
      if (scenarios.length > 1) {
        result.push({ type: 'scenario-toggle', scenarios })
      } else {
        result.push(...scenarios.map((s) => s.table))
      }
    } else {
      result.push(block)
      i++
    }
  }

  return result
}
