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

  // Triple exposure grid items (for scrolly step content)
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

  // Act I scrolly steps (memory, shipbuilding, grid)
  const memorySection  = actISubs.find((s) => s.heading.toLowerCase().includes('memory dominance'))
  const shipSection    = actISubs.find((s) => s.heading.toLowerCase().includes('shipbuilding'))
  const gridSection    = actISubs.find((s) => s.heading.toLowerCase().includes('one grid'))

  const buildStep = (sub: typeof memorySection) =>
    sub ? { label: sub.heading, content: getParagraphs(sub).join('\n\n') } : null

  // Act II
  const actIISubs     = getSubsections(sections, 'Act II')
  const actIISection  = findSection(sections, 'Act II')
  const actIIParagraphs = actIISection ? getParagraphs(actIISection) : []

  const spikeSection     = actIISubs.find((s) => s.heading.toLowerCase().includes('misleading'))
  const inflectionSection = actIISubs.find((s) => s.heading.toLowerCase().includes('6-month'))
  const stockpileSection = actIISubs.find((s) => s.heading.toLowerCase().includes('stockpile'))

  // Act III — now "One chip price tells the whole story"
  const actIIISubs    = getSubsections(sections, 'Act III')
  const actIIISection = findSection(sections, 'Act III')
  const actIIIParagraphs = actIIISection ? getParagraphs(actIIISection) : []

  const trendlineSection  = actIIISubs.find((s) => s.heading.toLowerCase().includes('trendline'))
  const preFireSection    = actIIISubs.find((s) => s.heading.toLowerCase().includes('pre-existing'))
  const scenariosSection  = actIIISubs.find((s) => s.heading.toLowerCase().includes('scenarios'))
  const assumptionSection = actIIISubs.find((s) => s.heading.toLowerCase().includes('assumption'))

  // Act IV — feedback loop (was Act III, reframed as bottleneck)
  const actIVSubs    = getSubsections(sections, 'Act IV')
  const actIVSection = findSection(sections, 'Act IV')
  const actIVParagraphs = actIVSection ? getParagraphs(actIVSection) : []

  const loopSection     = actIVSubs.find((s) => s.heading.toLowerCase().includes('the loop'))
  const breakerSection  = actIVSubs.find((s) => s.heading.toLowerCase().includes('circuit'))

  // Scenario toggle (cost layers)
  const SCENARIO_LABELS = ['60-day resolution', '6-month scenario', '3-5 year force majeure']
  const SCENARIO_TABLES = [
    {
      headers: ['Cost layer', '60-day impact'],
      rows: [
        ['Helium', '+40-50% spot (2% of market only)'],
        ['Korean energy', '+40-60% spot LNG'],
        ['Petrochemicals', '+10-15%'],
        ['Korean fab output', 'Stockpiles hold'],
        ['GPU module', '+0-2%'],
        ['Cloud GPU hour', '+2-4%'],
      ],
    },
    {
      headers: ['Cost layer', '6-month impact'],
      rows: [
        ['Helium', '+100-200% contract'],
        ['Korean energy', '+25-35% sustained'],
        ['Petrochemicals', '+20-30%'],
        ['Korean fab output', '-10-30% utilisation'],
        ['GPU module', '+8-15%'],
        ['Cloud GPU hour', '+12-20%'],
      ],
    },
    {
      headers: ['Cost layer', '3-5 year impact'],
      rows: [
        ['Helium', 'New structural price floor'],
        ['Korean energy', '+15-20% new normal'],
        ['Petrochemicals', '+10-15% sustained'],
        ['Korean fab output', 'Cost advantage lost'],
        ['GPU module', '+15-25%'],
        ['Cloud GPU hour', '+30-50%'],
      ],
    },
  ]

  // What to watch
  const takeawaySection = findSection(sections, 'What to watch')
  const takeawayItems = takeawaySection
    ? parseBoldItems(takeawaySection.body).map((item) => ({
        audience: item.label.replace(/^For\s+/i, ''),
        content: item.content,
      }))
    : []

  // Methodology
  const methSection   = findSection(sections, 'Methodology')
  const methParagraphs = methSection ? getParagraphs(methSection) : []

  // Footer
  const footerSection = sections[sections.length - 1]
  const footerBody    = footerSection ? getParagraphs(footerSection) : []
  const footerText    = footerBody.find((p) => p.startsWith('*'))?.replace(/^\*|\*$/g, '') ?? ''

  return {
    frontmatter: story.frontmatter,
    hero: { title: heroSection?.heading ?? '', dek, byline },
    stat: { value: '18%', description: statParagraphs.join(' ') },
    actI: {
      paragraphs: actIParagraphs,
      exposureItems,
      memoryStep: buildStep(memorySection),
      shipStep:   buildStep(shipSection),
      gridStep:   buildStep(gridSection),
    },
    actII: {
      paragraphs: actIIParagraphs,
      spikeStep:     buildStep(spikeSection),
      inflectionStep: buildStep(inflectionSection),
      stockpileStep: buildStep(stockpileSection),
    },
    actIII: {
      paragraphs: actIIIParagraphs,
      trendlineStep:  buildStep(trendlineSection),
      preFireStep:    buildStep(preFireSection),
      scenariosStep:  buildStep(scenariosSection),
      assumptionStep: buildStep(assumptionSection),
      scenarioLabels: SCENARIO_LABELS,
      scenarioTables: SCENARIO_TABLES,
    },
    actIV: {
      paragraphs: actIVParagraphs,
      loopStep:    buildStep(loopSection),
      breakerStep: buildStep(breakerSection),
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

  // Helper: filter nulls
  const steps = (...args: ({ label: string; content: string } | null)[]) =>
    args.filter((s): s is { label: string; content: string } => s !== null)

  return (
    <ThemeProvider theme={frontmatter.theme}>
      <article>

        {/* ── Hero ── */}
        <Hero block={{ type: 'hero', ...data.hero }} />

        <Divider />

        {/* ── 18% stat block ── */}
        <StatBlock block={{ type: 'stat-block', ...data.stat }} />

        {/* ── Stock candlestick: 2026 vs 2008 scrollytelling ── */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'stock-candlestick',
            steps: [
              {
                label: '2026 crash',
                content: "South Korea's stock market plunged **18%** in four trading days — the worst since 2008. Over **$500 billion** erased. Samsung and SK Hynix each fell more than **20%** in a single week.",
              },
              {
                label: '2008 comparison',
                content: 'Speed is the difference. The 2008 financial crisis took a year to erase 54%. The 2026 collapse hit in four trading days. The market has priced in a supply chain fracture — not just a geopolitical shock.',
              },
            ],
          }}
        />

        <Divider />

        {/* ── ACT I ── */}
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

        {/* Polar area chart: triple exposure */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'polar-exposure',
            steps: [
              {
                label: 'Oil exposure',
                content: '**Oil: 70%** of crude from the Middle East. Used for naphtha — a feedstock for semiconductor chemicals, not just fuel. Now on the government\'s "economic security" watchlist. Oil at $119 a barrel.',
              },
              {
                label: 'Helium exposure',
                content: '**Helium: 64.7%** from Qatar. The highest dependency of any major chip-producing nation. No substitute exists for plasma etch cooling. One-third of global supply removed in a single week.',
              },
              {
                label: 'Gas exposure',
                content: '**Gas (LNG): 26%** of electricity generated from gas. Qatar declared force majeure on Korean contracts. SK Hynix was building an LNG plant to power its own fabs. That gas now carries a 3-5 year disruption notice.',
              },
            ],
          }}
        />

        {/* HBM/DRAM treemap */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'hbm-treemap',
            steps: steps(data.actI.memoryStep, data.actI.gridStep),
          }}
        />

        {/* LNG carrier treemap */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'lng-treemap',
            steps: steps(data.actI.shipStep),
          }}
        />

        <Divider />

        {/* ── ACT II ── */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act II',
            title: "The chokepoint — how Qatar's helium reaches a Korean fab",
          }}
        />

        {data.actII.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actII.paragraphs }} />
        )}

        {/* Interactive Mapbox globe: supply chain route Qatar → Korea */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'mapbox-globe',
            mapSteps: [
              {
                center: [51.53, 25.29],
                zoom: 9,
                pitch: 45,
                bearing: -20,
                highlight: { coordinates: [51.53, 25.97], label: 'Ras Laffan Industrial City', color: '#1D9E75' },
              },
              {
                center: [56.27, 26.57],
                zoom: 7.5,
                pitch: 30,
                bearing: 0,
                speed: 0.6,
                highlight: { coordinates: [56.27, 26.57], label: 'Strait of Hormuz — chokepoint', color: '#E24B4A' },
              },
              {
                center: [80, 15],
                zoom: 3.5,
                pitch: 20,
                bearing: 30,
                speed: 0.5,
              },
              {
                center: [127.0, 37.0],
                zoom: 8,
                pitch: 50,
                bearing: -15,
                speed: 0.6,
                highlight: { coordinates: [127.0, 37.56], label: 'Seoul — Samsung & SK Hynix HQ', color: '#D85A30' },
              },
            ],
            steps: [
              {
                label: 'Ras Laffan, Qatar',
                content: "Qatar's three helium plants at **Ras Laffan** produce **33.2%** of global supply. Helium 1 (660M scf/yr), Helium 2 (1.3B scf/yr — the world's largest), and Helium 3 (400M scf/yr). Combined: **2,360M scf/yr**.",
              },
              {
                label: 'The Strait of Hormuz',
                content: 'Every tanker carrying Qatar\'s LNG — and its helium byproduct — must pass through the **Strait of Hormuz**. At its narrowest: **34 km**. All three plants have been **offline since March 2**. When the gas stops, the helium stops.',
              },
              {
                label: 'The sea route',
                content: 'The supply chain stretches **7,000+ nautical miles** from Qatar to Korean ports. LNG carriers take **15-20 days** one way. Any disruption at the origin ripples forward for weeks before stockpiles feel it.',
              },
              {
                label: 'Korea — end of the line',
                content: 'Samsung and SK Hynix fabs in **Icheon, Pyeongtaek, and Cheongju** depend on this chain. The United States produces 42% of global helium but cannot rapidly scale. Russia\'s Amur plant faces Western sanctions. **There is no easy replacement.**',
              },
            ],
          }}
        />

        {/* Qatar plant map (SVG detail view) */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'qatar-map',
            steps: [
              {
                label: 'The three plants',
                content: "Qatar's three helium plants at **Ras Laffan** produce **33.2%** of global supply. Helium 1 (660M scf/yr), Helium 2 (1.3B scf/yr — the world's largest), and Helium 3 (400M scf/yr). Combined: **2,360M scf/yr**.",
              },
              {
                label: 'All offline since March 2',
                content: 'All three plants have been **offline since March 2**. Helium is extracted from the natural gas stream during cryogenic liquefaction. When the gas stops flowing, the helium stops flowing. One-third of global supply, removed in a single week.',
              },
              {
                label: 'Global supply shock',
                content: 'The United States produces 42% of global helium but cannot rapidly scale. Russia\'s Amur plant faces Western sanctions. Algeria is only 5-10% of supply. Tanzania is years from production. **There is no easy replacement.**',
              },
            ],
          }}
        />

        {/* Helium price line chart */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'helium-price',
            steps: steps(data.actII.spikeStep, data.actII.inflectionStep, data.actII.stockpileStep),
          }}
        />

        <Divider />

        {/* ── ACT III: One chip price tells the whole story ── */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act III',
            title: 'One chip price tells the whole story',
          }}
        />

        {data.actIII.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actIII.paragraphs }} />
        )}

        {/* 172% stat before the DDR5 chart */}
        <StatBlock
          block={{
            type: 'stat-block',
            value: '3.4×',
            description: 'DDR5 16Gb spot price multiplied in 10 weeks — from $6.84 in September 2025 to $27.20 in December. Before the first missile hit Ras Laffan.',
          }}
        />

        {/* DDR5 area chart with 3 scenario bands */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'ddr5-area',
            steps: [
              {
                label: 'The pre-existing fire',
                content: 'DRAM prices rose **172%** through 2025. DDR5 contract pricing more than doubled. Server DRAM climbed **60% QoQ** in Q1 2026. HBM consumes **3× the wafer capacity** per gigabyte. Every wafer for an NVIDIA GPU is a wafer denied to everything else. The AI boom was eating its own supply chain.',
              },
              {
                label: 'The supercycle origin',
                content: 'The DDR5 16Gb spot price absorbs every upstream shock into one number. Google, Amazon, Microsoft, and Meta placed open-ended orders — accepting any supply at any cost. The memory supercycle was the crisis. **Hormuz is the accelerant.**',
              },
              {
                label: '60-day resolution: +2-4% GPU hour',
                content: 'If the conflict resolves within 60 days, stockpiles hold. Helium contracts don\'t reprice. Spot retreats to **~$18-20**. The Hormuz increment is invisible against the 172% pre-existing surge. GPU hour impact: **+2-4%** from baseline.',
              },
              {
                label: '6-month scenario: +12-20% GPU hour',
                content: 'At six months, helium contracts reprice — the **98%** starts moving toward $1,000-1,500/MCF. Korean fabs cut utilisation **10-30%** on helium-critical steps. Energy costs up **25-35%** sustained. DDR5 climbs to **~$30-35**. GPU hour impact: **+12-20%**.',
              },
              {
                label: '3-5 year force majeure: +30-50% GPU hour',
                content: 'The cost curve shifts permanently. Korean fabs lose their cost advantage. Micron (US-based, **zero Hormuz exposure**) gains structural edge. CXMT accelerates. DDR5 stabilises at a **$35-40 structural floor**. GPU hour impact: **+30-50%** — and "compute always gets cheaper" breaks.',
              },
            ],
          }}
        />

        {/* Scenario cost-layer toggle */}
        <ScenarioToggle
          block={{
            type: 'scenario-toggle',
            scenarios: data.actIII.scenarioLabels.map((label, i) => ({
              label,
              table: {
                type: 'data-table' as const,
                headers: data.actIII.scenarioTables[i].headers,
                rows: data.actIII.scenarioTables[i].rows,
              },
            })),
          }}
        />

        <Divider />

        {/* ── ACT IV: The slow bleed ── */}
        <ActHeader
          block={{
            type: 'act-header',
            actNumber: 'Act IV',
            title: 'The slow bleed — decisions made now, deliveries missed in 2028',
          }}
        />

        {data.actIV.paragraphs.length > 0 && (
          <ProseSection block={{ type: 'prose', paragraphs: data.actIV.paragraphs }} />
        )}

        {/* Korean yards → global LNG importers map */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'mapbox-globe',
            mapSteps: [
              {
                center: [129.3, 35.5],
                zoom: 7,
                pitch: 45,
                bearing: -10,
                highlight: { coordinates: [129.3, 35.5], label: 'HD Hyundai — Ulsan', color: '#EF9F27', radius: 16 },
              },
              {
                center: [128.6, 34.9],
                zoom: 7,
                pitch: 40,
                bearing: 15,
                highlight: { coordinates: [128.6, 34.9], label: 'Samsung Heavy + Hanwha — Geoje', color: '#EF9F27', radius: 14 },
              },
              {
                center: [100, 20],
                zoom: 2,
                pitch: 10,
                bearing: 0,
                speed: 0.5,
              },
              {
                center: [51.5, 25.3],
                zoom: 6,
                pitch: 30,
                bearing: -20,
                speed: 0.6,
                highlight: { coordinates: [51.5, 25.3], label: 'Qatar — LNG customer, orders now at risk', color: '#E24B4A', radius: 14 },
              },
            ],
            steps: [
              {
                label: 'Korean yards: the world\'s LNG shipbuilder',
                content: 'South Korea builds **over 70%** of all LNG carriers globally. HD Hyundai (Ulsan) and Samsung Heavy Industries + Hanwha Ocean (Geoje) hold a **$71.3B backlog** in LNG carrier orders. These ships take **30–36 months** from order to delivery.',
              },
              {
                label: 'Margin erosion begins now',
                content: 'As Korean energy costs rise **40–60%** on spot LNG and petrochemical feedstock prices climb, shipyard operating margins compress. When margins fall below a threshold, new orders migrate — first to Chinese yards (CSSC, DSIC), then stall entirely.',
              },
              {
                label: 'A global delivery gap in 2028',
                content: 'Every order that migrates or cancels in **Q2–Q3 2026** is a vessel that will not be delivered in **2028–2029**. The LNG fleet cannot scale fast enough to replace Qatar supply — and the ships that would carry alternative supply simply won\'t exist.',
              },
              {
                label: 'Watch Korean yard Q2–Q3 2026 order books',
                content: 'The signal is measurable now: track quarterly order announcements from HD Hyundai and Samsung Heavy. If Chinese yards (CSSC, DSIC) gain LNG carrier share in 2026, the 2028 fleet gap is confirmed — before a single delivery is missed.',
              },
            ],
          }}
        />

        {/* Feedback loop diagram */}
        <ScrollySection
          block={{
            type: 'scrolly-section',
            chartId: 'feedback-loop',
            steps: steps(data.actIV.loopStep, data.actIV.breakerStep),
          }}
        />

        <Divider />

        {/* ── What to watch ── */}
        {data.takeaways.length > 0 && (
          <TakeawayGrid block={{ type: 'takeaway-grid', items: data.takeaways }} />
        )}

        <Divider />

        {/* ── Methodology ── */}
        {data.methodology.length > 0 && (
          <MethodologySection block={{ type: 'methodology', content: data.methodology }} />
        )}

        {/* ── Footer ── */}
        {data.footer && <FooterBlock block={{ type: 'footer', text: data.footer }} />}

      </article>
    </ThemeProvider>
  )
}
