import { Metadata } from 'next'
import {
  getStoryContent,
  findSection,
  getSubsections,
  getParagraphs,
  parseBoldItems,
} from '@/lib/content'
import ThemeProvider from '@/components/story/ThemeProvider'
import Hero from '@/components/story/Hero'
import StatBlock from '@/components/story/StatBlock'
import ActHeader from '@/components/story/ActHeader'
import Divider from '@/components/story/Divider'
import ProseSection from '@/components/story/ProseSection'
import ExposureGrid from '@/components/story/ExposureGrid'
import ScrollySection from '@/components/story/ScrollySection'
import ScenarioToggle from '@/components/story/ScenarioToggle'
import TakeawayGrid from '@/components/story/TakeawayGrid'
import MethodologySection from '@/components/story/MethodologySection'
import FooterBlock from '@/components/story/FooterBlock'

const SLUG = 'south-korea-gpu-hour'

function loadContent() {
  const story = getStoryContent(SLUG)
  const { sections } = story

  // Hero: first h1 section
  const heroSection = sections.find((s) => s.level === 1)
  const heroBody = heroSection ? getParagraphs(heroSection) : []
  const dek = heroBody.find((p) => p.startsWith('*') && !p.startsWith('**'))?.replace(/^\*|\*$/g, '') ?? ''
  const byline = heroBody.find((p) => p.startsWith('**'))?.replace(/^\*\*|\*\*$/g, '') ?? ''

  // 18% stat
  const statSection = findSection(sections, '18%')
  const statParagraphs = statSection ? getParagraphs(statSection) : []

  // Act I
  const actISubs = getSubsections(sections, 'Act I')
  const actIProse = findSection(sections, 'Act I')
  const actIParagraphs = actIProse ? getParagraphs(actIProse) : []

  // Triple exposure grid
  const exposureSection = actISubs.find((s) => s.heading.toLowerCase().includes('triple exposure'))
  const exposureItems = exposureSection
    ? parseBoldItems(exposureSection.body).map((item) => {
        const match = item.label.match(/^(.+?):\s*(.+)$/)
        return {
          label: match ? match[1] : item.label,
          value: match ? match[2] : '',
          description: item.content,
        }
      })
    : []

  // Scrolly subsections for each act
  const buildScrollySteps = (actQuery: string) => {
    const subs = getSubsections(sections, actQuery)
    return subs
      .filter((s) => {
        const body = s.body.join('\n').trim()
        return body && !body.includes('|') && !s.heading.toLowerCase().includes('exposure') && !s.heading.toLowerCase().includes('triple')
      })
      .map((s) => ({
        label: s.heading,
        content: getParagraphs(s).join('\n\n'),
      }))
  }

  const actIScrolly = buildScrollySteps('Act I')
  const actIIScrolly = buildScrollySteps('Act II')
  const actIIIScrolly = buildScrollySteps('Act III')
  const actIVScrolly = buildScrollySteps('Act IV')

  // Act II, III, IV prose
  const actIISection = findSection(sections, 'Act II')
  const actIIIProse = findSection(sections, 'Act III')
  const actIVSection = findSection(sections, 'Act IV')

  // Scenario toggle: find Act IV subsections with tables
  const actIVSubs = getSubsections(sections, 'Act IV')
  const scenarioSection = actIVSubs.find((s) => s.heading.toLowerCase().includes('cost transmission'))
  const scenarioLabels: string[] = []
  const scenarioTables: { headers: string[]; rows: string[][] }[] = []
  if (scenarioSection) {
    // Parse scenario content: bold labels followed by tables
    // Split on lines starting with ** (bold scenario labels)
    const body = scenarioSection.body.join('\n')
    const scenarioBlocks = body.split(/(?=^\*\*[^*]+\*\*)/m).filter(Boolean)
    for (const block of scenarioBlocks) {
      const labelMatch = block.match(/^\*\*([^*]+)\*\*/)
      const tableLines = block.split('\n').filter((l) => l.trim().startsWith('|'))
      if (labelMatch && tableLines.length >= 3) {
        scenarioLabels.push(labelMatch[1].replace(/[.:]+$/, '').trim())
        const parseRow = (line: string) =>
          line.split('|').map((c) => c.trim()).filter((c) => c && !/^-+$/.test(c))
        scenarioTables.push({
          headers: parseRow(tableLines[0]),
          rows: tableLines.slice(2).map(parseRow).filter((r) => r.length > 0),
        })
      }
    }
  }

  // What to watch
  const takeawaySection = findSection(sections, 'What to watch')
  const takeawayItems = takeawaySection
    ? parseBoldItems(takeawaySection.body).map((item) => ({
        audience: item.label.replace(/^For\s+/i, ''),
        content: item.content,
      }))
    : []

  // Methodology
  const methSection = findSection(sections, 'Methodology')
  const methParagraphs = methSection ? getParagraphs(methSection) : []

  // Footer
  const footerSection = sections[sections.length - 1]
  const footerBody = footerSection ? getParagraphs(footerSection) : []
  const footerText = footerBody.find((p) => p.startsWith('*'))?.replace(/^\*|\*$/g, '') ?? ''

  return {
    frontmatter: story.frontmatter,
    hero: { title: heroSection?.heading ?? '', dek, byline },
    stat: { value: '18%', description: statParagraphs.join(' ') },
    actI: { paragraphs: actIParagraphs, exposureItems, scrollySteps: actIScrolly },
    actII: {
      paragraphs: actIISection ? getParagraphs(actIISection) : [],
      scrollySteps: actIIScrolly,
    },
    actIII: {
      paragraphs: actIIIProse ? getParagraphs(actIIIProse) : [],
      scrollySteps: actIIIScrolly,
    },
    actIV: {
      paragraphs: actIVSection ? getParagraphs(actIVSection) : [],
      scrollySteps: actIVScrolly,
      scenarioLabels,
      scenarioTables,
    },
    takeaways: takeawayItems,
    methodology: methParagraphs,
    footer: footerText,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = getStoryContent(SLUG)
  return {
    title: `${frontmatter.title} — ${frontmatter.subtitle}`,
    description: frontmatter.subtitle,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.subtitle,
    },
  }
}

export default function SouthKoreaGPUHourPage() {
  const data = loadContent()
  const { frontmatter } = data

  return (
    <ThemeProvider theme={frontmatter.theme}>
      <article>
        {/* Hero */}
        <Hero block={{ type: 'hero', ...data.hero }} />

        <Divider />

        {/* 18% stat */}
        <StatBlock block={{ type: 'stat-block', ...data.stat }} />

        {/* Stat prose */}
        {data.stat.description && (
          <ProseSection
            block={{
              type: 'prose',
              paragraphs: data.stat.description.split(/(?<=\.) (?=[A-Z])/),
            }}
          />
        )}

        <Divider />

        {/* Act I */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act I',
            title: 'The most consequential industrial economy in this crisis',
          }}
        />

        {data.actI.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actI.paragraphs }} />
        )}

        {data.actI.exposureItems.length > 0 && (
          <ExposureGrid block={{ type: 'exposure-grid', items: data.actI.exposureItems }} />
        )}

        {data.actI.scrollySteps.length > 0 && (
          <ScrollySection
            block={{
              type: 'scrolly-section',
              steps: data.actI.scrollySteps,
              chartId: 'korea-bar',
            }}
          />
        )}

        <Divider />

        {/* Act II */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act II',
            title: 'The chokepoint — how Qatar\'s helium reaches a Korean fab',
          }}
        />

        {data.actII.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actII.paragraphs }} />
        )}

        {data.actII.scrollySteps.length > 0 && (
          <ScrollySection
            block={{
              type: 'scrolly-section',
              steps: data.actII.scrollySteps,
              chartId: 'helium-price',
            }}
          />
        )}

        <Divider />

        {/* Act III */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act III',
            title: 'The feedback loop nobody has connected',
          }}
        />

        {data.actIII.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actIII.paragraphs }} />
        )}

        {data.actIII.scrollySteps.length > 0 && (
          <ScrollySection
            block={{
              type: 'scrolly-section',
              steps: data.actIII.scrollySteps,
              chartId: 'feedback-loop',
            }}
          />
        )}

        <Divider />

        {/* Act IV */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act IV',
            title: 'How this reprices a GPU hour in Virginia',
          }}
        />

        {data.actIV.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actIV.paragraphs }} />
        )}

        {data.actIV.scrollySteps.length > 0 && (
          <ScrollySection
            block={{
              type: 'scrolly-section',
              steps: data.actIV.scrollySteps,
              chartId: 'dram-price',
            }}
          />
        )}

        {/* Scenario Toggle */}
        {data.actIV.scenarioLabels.length > 1 && (
          <ScenarioToggle
            block={{
              type: 'scenario-toggle',
              scenarios: data.actIV.scenarioLabels.map((label, i) => ({
                label,
                table: {
                  type: 'data-table' as const,
                  headers: data.actIV.scenarioTables[i].headers,
                  rows: data.actIV.scenarioTables[i].rows,
                },
              })),
            }}
          />
        )}

        <Divider />

        {/* Takeaways */}
        {data.takeaways.length > 0 && (
          <TakeawayGrid block={{ type: 'takeaway-grid', items: data.takeaways }} />
        )}

        <Divider />

        {/* Methodology */}
        {data.methodology.length > 0 && (
          <MethodologySection block={{ type: 'methodology', content: data.methodology }} />
        )}

        {/* Footer */}
        {data.footer && <FooterBlock block={{ type: 'footer', text: data.footer }} />}
      </article>
    </ThemeProvider>
  )
}
