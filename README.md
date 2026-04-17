# Vizmaya

A data-driven visual storytelling platform that pairs scroll-synced maps, charts, and prose to narrate complex geopolitical and market stories.

Built with **Next.js 16**, **Mapbox GL**, **Apache ECharts**, and **GSAP ScrollTrigger**.

---

## How It Works

Each story is a full-viewport scroll-snap experience with three persistent layers:

1. **Map background** (Mapbox GL) — flies between real-world coordinates as the reader scrolls
2. **Foreground chart** (ECharts) — transitions between data steps without remounting
3. **Text cards** — snap-locked prose that drives both layers via IntersectionObserver

Stories are authored as **Markdown + YAML config** and statically generated at build time.

---

## Project Structure

```
app/
  page.tsx                    # Home (story listing)
  story/[slug]/page.tsx       # Dynamic story pages (SSG)
  map-edit/                   # Map editing interface
  api/                        # Mapbox + story endpoints

components/
  story/
    StoryRenderer.tsx          # Block type -> component dispatcher
    StoryMapShell.tsx          # Page-level orchestrator (map + chart + text)
    MapStorySection.tsx        # Scroll-snap text cards
    ChartPanel.tsx             # Chart registry (foreground)
    ScrollySection.tsx         # Scroll-triggered animations
    Hero.tsx                   # Title block
    StatBlock.tsx              # Large number display
    ActHeader.tsx              # Section headers ("Act I", "Act II")
    ProseSection.tsx           # Text paragraphs
    ScenarioToggle.tsx         # Multi-scenario selector
    ThemeProvider.tsx           # CSS variable injection per story
    charts/
      MapboxBackground.tsx     # Persistent map layer (fixed, z-0)
      StockCandlestickChart.tsx
      HeliumPriceChart.tsx
      DRAMPriceChart.tsx
      DDR5AreaChart.tsx
      PolarExposureChart.tsx
      HBMDRAMTreemap.tsx
      ...
  share/                       # Social sharing cards + export
  autoplay/                    # Video/autoplay mode

content/
  stories/
    south-korea-gpu-hour/
      .md                      # Story prose (frontmatter + markdown)
      .config.yaml             # Map states, chart steps, scroll units
      .share.yaml              # Sharing card definitions

lib/
  content.ts                   # Story file reading & parsing
  storyConfig.ts               # YAML config loader
  storyConfig.types.ts         # TypeScript types for story structure
  chartTheme.ts                # ECharts theme + responsive hooks
  resolveUnits.ts              # Config -> snap targets
  use-in-view.ts               # IntersectionObserver hook

scripts/
  generate-audio.ts            # TTS audio generation (Gemini API)
```

---

## Story Architecture

### Content Authoring

Each story lives in `content/stories/<slug>/` with three files:

| File | Purpose |
|------|---------|
| `.md` | Prose content with YAML frontmatter (title, subtitle, colors, byline) |
| `.config.yaml` | Scroll units, map states (center/zoom/pitch/pins), chart steps |
| `.share.yaml` | Social sharing card definitions |

### Scroll-Snap Model

The config defines **sections**, each mapping to:

- **One map state** — geographic center, zoom, pitch, bearing, pins, opacity
- **Multiple subsections** — chart advances while the map holds steady
- **Text references** — heading strings that resolve to markdown content

At runtime, the config resolves into **units** (snap targets). Each unit occupies one full viewport. IntersectionObserver detects which unit is active and drives:

- `activeParent` — triggers map `flyTo` transition
- `activeStep` — advances the chart within the current section
- `currentChart` — switches which foreground chart renders

### Block Types

The `StoryRenderer` maps content blocks to components:

| Block | Component | Purpose |
|-------|-----------|---------|
| `hero` | Hero | Title + subtitle + byline |
| `stat-block` | StatBlock | Large featured number |
| `act-header` | ActHeader | Act dividers |
| `prose` | ProseSection | Text paragraphs |
| `data-table` | DataTable | Markdown tables |
| `exposure-grid` | ExposureGrid | Risk/factor grid |
| `scrolly-section` | ScrollySection | Scroll-triggered chart + text |
| `scenario-toggle` | ScenarioToggle | Multi-scenario selector |
| `takeaway-grid` | TakeawayGrid | Key takeaway cards |
| `methodology` | MethodologySection | Sources & methods |

### Responsive Strategy

- **Desktop** (`desktopUnits`) — text cards in a right column (63vw), map fills left
- **Mobile** (`mobileUnits`) — cards centered/fullscreen, map behind
- Viewport change resets active unit and scrolls to top
- Maps use `landscapeFocusArea` / `portraitFocusArea` to shift focal points

---

## Theme System

Story frontmatter defines theme colors as hex values. `ThemeProvider` injects them as CSS variables:

```
--color-background, --color-foreground, --color-accent, --color-accent2,
--color-teal, --color-surface, --color-muted, --color-positive, --color-line
```

Charts, maps, and text all read from these variables, allowing per-story color customization without code changes.

---

## Tech Stack

| Category | Tool |
|----------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, PostCSS |
| Maps | Mapbox GL JS |
| Charts | Apache ECharts |
| Animations | GSAP (ScrollTrigger), Rive |
| Icons | Phosphor Icons, Iconify |
| Backend | Supabase |
| Export | html-to-image, JSZip |
| Analytics | Vercel Analytics, Google Analytics |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Required: NEXT_PUBLIC_MAPBOX_TOKEN

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox GL map rendering |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Database connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public auth |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-side Supabase operations |
| `GEMINI_API_KEY` | No | TTS audio generation |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Static generation build |
| `npm run start` | Production server |
| `npm run lint` | ESLint checks |
| `npm run generate-audio` | Generate TTS audio via Gemini API |
