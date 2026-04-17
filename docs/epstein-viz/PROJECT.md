# Epstein Document Visualization

A geospatial intelligence tool that ingests official Epstein-related government documents and renders interactive map-based stories — clustering locations, people, and events extracted via LLM NER.

## Data Sources

| Source | URL | Volume |
|--------|-----|--------|
| DOJ Epstein Library | https://www.justice.gov/epstein | ~3.5M pages, 2,000+ videos, 180,000 images |
| DOJ Disclosures | https://www.justice.gov/epstein/doj-disclosures | Primary text corpus |
| House Oversight Committee | https://oversight.house.gov | 33,295 pages (Sep 2025) + 20,000 pages (Nov 2025) |
| FBI Vault | https://vault.fbi.gov/jeffrey-epstein | 22 FOIA parts |

---

## Architecture

```
[Sources] → [Ingest] → [OCR/Extract] → [NER/Claude] → [Resolve/Geocode] → [Graph] → [Map UI]
```

### Tech Stack

| Layer | Tool |
|-------|------|
| Ingestion | Node.js + existing ingest pipeline |
| OCR | Tesseract.js / AWS Textract |
| NER | Claude API (structured output) |
| Storage | Postgres + pgvector (Supabase) |
| Geocoding | Nominatim (free) or Google Maps |
| Graph | graphology (JS) |
| Map | Deck.gl + Mapbox |
| Frontend | Next.js |

---

## Entity Schema

### Location
```ts
{
  id: string
  name: string
  lat: number
  lng: number
  mention_count: number
  mentioned_by: string[]   // people who mentioned this location
  source_docs: string[]
}
```

### Person
```ts
{
  id: string
  name: string
  role?: string
  associated_location: string   // e.g. "Trump" → "USA"
  mention_count: number
  source_docs: string[]
}
```

### Event
```ts
{
  id: string
  name: string
  date?: string
  location: string             // e.g. "2008 crash" → "New York"
  mention_count: number
  source_docs: string[]
}
```

### Substory
```ts
{
  id: string
  title: string               // LLM-generated summary
  people: string[]
  locations: string[]
  events: string[]
  doc_count: number
}
```

---

## Phases & Progress

### Phase 1 — Ingestion & Text Extraction
**Status:** `[ ] Not started`

- [ ] Crawl DOJ/FBI/House Oversight pages
- [ ] Download PDFs + images (sample: 100 docs first)
- [ ] Extract text via `pdf-parse` / `pdfjs`
- [ ] OCR scanned images via Tesseract.js
- [ ] Chunk into ~2,000-token segments
- [ ] Store in pgvector with source metadata (doc ID, page, URL)

### Phase 2 — Entity Extraction (NER)
**Status:** `[ ] Not started`

- [ ] Design Claude structured output prompt for locations / people / events
- [ ] Run extraction on sample corpus
- [ ] Validate quality manually
- [ ] Cache results by chunk hash
- [ ] Scale to full corpus

**NER Prompt Target Output:**
```json
{
  "locations": [{ "name": "", "context": "", "mentioned_by": "" }],
  "people": [{ "name": "", "role": "", "associated_location": "" }],
  "events": [{ "name": "", "date": "", "location": "", "description": "" }]
}
```

### Phase 3 — Entity Resolution & Geocoding
**Status:** `[ ] Not started`

- [ ] Deduplicate entities across chunks (e.g. "NYC" = "New York")
- [ ] People → location lookup (Wikidata/Wikipedia API)
- [ ] Geocode all locations via Nominatim
- [ ] Persist as normalized entity records

### Phase 4 — Substory Graph
**Status:** `[ ] Not started`

- [ ] Build co-occurrence graph (nodes: people/locations/events, edges: co-mention in same chunk)
- [ ] Run Louvain community detection to cluster into substories
- [ ] Generate substory titles via Claude
- [ ] Store substory membership

### Phase 5 — Map Visualization
**Status:** `[ ] Not started`

- [ ] Set up Deck.gl + Mapbox base
- [ ] Heatmap layer: location mention frequency
- [ ] Point markers: people (sized by mention count)
- [ ] Event pins + timeline slider
- [ ] Substory sidebar panel (narrative + key figures + source docs)
- [ ] Filters: date range, entity type, document source

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Sample ingest (100 docs) | — | `[ ] Pending` |
| NER pipeline validated | — | `[ ] Pending` |
| Full corpus ingested | — | `[ ] Pending` |
| Map MVP live | — | `[ ] Pending` |
| Substory clustering | — | `[ ] Pending` |
| Public launch | — | `[ ] Pending` |

---

## Open Questions

- [ ] Rate limits / ToS for scraping DOJ/FBI pages — may need to contact directly or use bulk download if available
- [ ] Storage budget for 3.5M pages of vectors
- [ ] People → location resolution accuracy (Wikidata may be incomplete for minor figures)
- [ ] Substory naming quality — need to evaluate Claude's summaries
- [ ] Video/image content: transcribe videos? Run object detection on images?

---

## Notes

- Start small: validate the full pipeline on 100 docs before scaling
- The existing `supro/ingest-pipeline` branch has the foundation for ingestion
- Substories are the key differentiator — pure maps exist, narrative clustering does not
