"use client";

import { useEffect, useState, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map } from "react-map-gl/mapbox";
import { DeckGL } from "@deck.gl/react";
import { FlyToInterpolator } from "deck.gl";
import { ScatterplotLayer, TextLayer } from "@deck.gl/layers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Location {
  id: string;
  name: string;
  canonical_name: string | null;
  lat: number;
  lng: number;
  mention_count: number;
}

interface Person {
  id: string;
  name: string;
  role: string | null;
  associated_location: string | null;
  mention_count: number;
}

interface Event {
  id: string;
  name: string;
  event_date: string | null;
  location_name: string | null;
  mention_count: number;
}

interface Substory {
  id: string;
  title: string;
  summary: string;
  narrative: string | null;
  doc_count: number;
  people: string[];
  locations: string[];
  events: string[];
}

interface SourceDoc {
  id: string;
  source: string;
  source_url: string;
  filename: string | null;
  context: string | null;
}

type EntityType = "location" | "person" | "event";

interface SelectedEntity {
  id: string;
  type: EntityType;
  name: string;
  role?: string | null;
  mention_count: number;
  lat: number;
  lng: number;
}

type LayerMode = "all" | "locations" | "people";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_VIEW_STATE = {
  longitude: -88,
  latitude: 36,
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
};

// Colors per entity type [r, g, b, a]
const COLORS: Record<EntityType, [number, number, number, number]> = {
  location: [255, 120, 20, 220],
  person: [80, 160, 255, 220],
  event: [160, 80, 255, 220],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jitter(val: number, idx: number, total: number): number {
  if (total <= 1) return val;
  const spread = 0.6;
  return val + ((idx / (total - 1)) - 0.5) * spread;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EpsteinMap() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const [locations, setLocations] = useState<Location[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [substories, setSubstories] = useState<Substory[]>([]);

  const [selectedSubstory, setSelectedSubstory] = useState<Substory | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [entityDocs, setEntityDocs] = useState<SourceDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [layerMode, setLayerMode] = useState<LayerMode>("all");
  const [loading, setLoading] = useState(true);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Data fetch
  // -------------------------------------------------------------------------

  useEffect(() => {
    Promise.all([
      fetch("/api/epstein/entities?type=all&limit=2000").then((r) => r.json()),
      fetch("/api/epstein/substories").then((r) => r.json()),
    ])
      .then(([entities, subs]) => {
        setLocations(entities.locations ?? []);
        setPeople(entities.people ?? []);
        setEvents(entities.events ?? []);
        setSubstories(subs ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // -------------------------------------------------------------------------
  // Resolve people → map coordinates via associated_location
  // -------------------------------------------------------------------------

  const locationByName = useCallback(
    (name: string | null): Location | undefined => {
      if (!name) return undefined;
      const lower = name.toLowerCase();
      return (
        locations.find((l) => (l.canonical_name ?? l.name).toLowerCase() === lower) ??
        locations.find((l) => l.name.toLowerCase() === lower) ??
        locations.find((l) => lower.includes(l.name.toLowerCase()))
      );
    },
    [locations]
  );

  // People with resolved coordinates (jitter when multiple people share a location)
  const mappedPeople = useCallback((): Array<Person & { lat: number; lng: number }> => {
    const byLoc: Record<string, Person[]> = {};
    const result: Array<Person & { lat: number; lng: number }> = [];

    for (const p of people) {
      const loc = locationByName(p.associated_location);
      if (!loc) continue;
      const key = `${loc.lat},${loc.lng}`;
      if (!byLoc[key]) byLoc[key] = [];
      byLoc[key].push(p);
    }

    for (const [key, group] of Object.entries(byLoc)) {
      const [lat, lng] = key.split(",").map(Number);
      group.forEach((p, i) => {
        result.push({
          ...p,
          lat: jitter(lat, i, group.length),
          lng: jitter(lng, i, group.length),
        });
      });
    }
    return result;
  }, [people, locationByName]);

  // Events with resolved coordinates
  const mappedEvents = useCallback((): Array<Event & { lat: number; lng: number }> => {
    return events.flatMap((e) => {
      const loc = locationByName(e.location_name);
      if (!loc) return [];
      return [{ ...e, lat: loc.lat + 0.3, lng: loc.lng + 0.3 }];
    });
  }, [events, locationByName]);

  // -------------------------------------------------------------------------
  // Filter by selected substory
  // -------------------------------------------------------------------------

  const activeLocations = selectedSubstory
    ? locations.filter(
        (l) =>
          selectedSubstory.locations.includes(l.canonical_name ?? l.name) ||
          selectedSubstory.locations.includes(l.name)
      )
    : locations;

  const activePeople = selectedSubstory
    ? mappedPeople().filter((p) =>
        selectedSubstory.people.some((n) => n.toLowerCase() === p.name.toLowerCase())
      )
    : mappedPeople();

  const activeEvents = selectedSubstory
    ? mappedEvents().filter((e) =>
        selectedSubstory.events.some((n) => n.toLowerCase() === e.name.toLowerCase())
      )
    : mappedEvents();

  // -------------------------------------------------------------------------
  // Click → fetch source docs
  // -------------------------------------------------------------------------

  const handleEntityClick = useCallback(
    async (entity: SelectedEntity) => {
      setSelectedEntity(entity);
      setEntityDocs([]);
      setDocsLoading(true);
      try {
        const r = await fetch(
          `/api/epstein/entity-docs?entityType=${entity.type}&entityId=${entity.id}`
        );
        const data = await r.json();
        setEntityDocs(data.docs ?? []);
      } catch {
        setEntityDocs([]);
      } finally {
        setDocsLoading(false);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Deck.gl layers
  // -------------------------------------------------------------------------

  const maxMentions = Math.max(
    ...activeLocations.map((l) => l.mention_count),
    ...activePeople.map((p) => p.mention_count),
    1
  );

  const locationsLayer = new ScatterplotLayer<Location>({
    id: "locations",
    data: layerMode !== "people" ? activeLocations.filter((l) => l.lat && l.lng) : [],
    getPosition: (d) => [d.lng, d.lat],
    getRadius: (d) => Math.max(Math.sqrt((d.mention_count / maxMentions) * 1600) * 1000 + 8000, 8000),
    radiusUnits: "meters",
    radiusMinPixels: 6,
    radiusMaxPixels: 40,
    getFillColor: COLORS.location,
    getLineColor: [255, 160, 60, 180],
    lineWidthMinPixels: 1.5,
    stroked: true,
    pickable: true,
    onHover: ({ object }) => setHoveredName(object ? (object.canonical_name ?? object.name) : null),
    onClick: ({ object }) => {
      if (object) {
        handleEntityClick({
          id: object.id,
          type: "location",
          name: object.canonical_name ?? object.name,
          mention_count: object.mention_count,
          lat: object.lat,
          lng: object.lng,
        });
      }
    },
  });

  const locationsLabelLayer = new TextLayer<Location>({
    id: "locations-labels",
    data: layerMode !== "people" ? activeLocations.filter((l) => l.lat && l.lng) : [],
    getPosition: (d) => [d.lng, d.lat],
    getText: (d) => d.canonical_name ?? d.name,
    getSize: 11,
    getColor: [255, 200, 140, 230],
    getBackgroundColor: [0, 0, 0, 160],
    background: true,
    backgroundPadding: [4, 2, 4, 2],
    fontFamily: "monospace",
    getTextAnchor: "middle",
    getAlignmentBaseline: "bottom",
    getPixelOffset: [0, -10],
  });

  const peopleLayer = new ScatterplotLayer<Person & { lat: number; lng: number }>({
    id: "people",
    data: layerMode !== "locations" ? activePeople : [],
    getPosition: (d) => [d.lng, d.lat],
    getRadius: 6000,
    radiusUnits: "meters",
    radiusMinPixels: 5,
    radiusMaxPixels: 20,
    getFillColor: COLORS.person,
    getLineColor: [140, 200, 255, 180],
    lineWidthMinPixels: 1,
    stroked: true,
    pickable: true,
    onHover: ({ object }) => setHoveredName(object ? object.name : null),
    onClick: ({ object }) => {
      if (object) {
        handleEntityClick({
          id: object.id,
          type: "person",
          name: object.name,
          role: object.role,
          mention_count: object.mention_count,
          lat: object.lat,
          lng: object.lng,
        });
      }
    },
  });

  const peopleLabelLayer = new TextLayer<Person & { lat: number; lng: number }>({
    id: "people-labels",
    data: layerMode !== "locations" ? activePeople : [],
    getPosition: (d) => [d.lng, d.lat],
    getText: (d) => d.name,
    getSize: 10,
    getColor: [160, 210, 255, 220],
    getBackgroundColor: [0, 0, 30, 160],
    background: true,
    backgroundPadding: [3, 2, 3, 2],
    fontFamily: "monospace",
    getTextAnchor: "middle",
    getAlignmentBaseline: "top",
    getPixelOffset: [0, 10],
  });

  const eventsLayer = new ScatterplotLayer<Event & { lat: number; lng: number }>({
    id: "events",
    data: activeEvents,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: 5000,
    radiusUnits: "meters",
    radiusMinPixels: 4,
    radiusMaxPixels: 16,
    getFillColor: COLORS.event,
    lineWidthMinPixels: 1,
    stroked: false,
    pickable: true,
    onHover: ({ object }) => setHoveredName(object ? object.name : null),
    onClick: ({ object }) => {
      if (object) {
        handleEntityClick({
          id: object.id,
          type: "event",
          name: object.name,
          mention_count: object.mention_count,
          lat: object.lat,
          lng: object.lng,
        });
      }
    },
  });

  const layers = [locationsLayer, locationsLabelLayer, peopleLayer, peopleLabelLayer, eventsLayer];

  // -------------------------------------------------------------------------
  // Fly to substory
  // -------------------------------------------------------------------------

  const flyToSubstory = useCallback(
    (sub: Substory) => {
      const relevant = locations.filter(
        (l) =>
          sub.locations.includes(l.canonical_name ?? l.name) ||
          sub.locations.includes(l.name)
      );
      if (!relevant.length) return;
      const lngs = relevant.map((l) => l.lng);
      const lats = relevant.map((l) => l.lat);
      setViewState({
        longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
        latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
        zoom: 4,
        pitch: 0,
        bearing: 0,
        // @ts-expect-error deck.gl transition props
        transitionDuration: 1200,
        transitionInterpolator: new FlyToInterpolator({ speed: 1.4 }),
      });
    },
    [locations]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const totalEntities =
    activeLocations.filter((l) => l.lat && l.lng).length +
    activePeople.length +
    activeEvents.length;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* Map */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: { viewState: unknown }) =>
          setViewState(vs as typeof viewState)
        }
        controller={{ doubleClickZoom: false }}
        layers={layers}
        style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0" }}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        onClick={({ object }) => {
          if (!object) {
            setSelectedEntity(null);
            setEntityDocs([]);
          }
        }}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          projection="mercator"
        />
      </DeckGL>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 py-3.5 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div>
          <h1 className="text-sm font-mono font-bold tracking-widest uppercase text-orange-400 leading-tight">
            Epstein Document Map
          </h1>
          <p className="text-xs text-white/40 mt-0.5 font-mono">
            {loading
              ? "Loading…"
              : `${activeLocations.filter((l) => l.lat && l.lng).length} places · ${activePeople.length} people · ${activeEvents.length} events`}
          </p>
        </div>

        {/* Layer toggle */}
        <div className="pointer-events-auto flex gap-1 bg-black/70 border border-white/10 rounded-full p-1">
          {(["all", "locations", "people"] as LayerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                layerMode === mode ? "bg-orange-500 text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {([
          { type: "location", label: "Place" },
          { type: "person", label: "Person" },
          { type: "event", label: "Event" },
        ] as { type: EntityType; label: string }[]).map(({ type, label }) => {
          const [r, g, b] = COLORS[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ background: `rgb(${r},${g},${b})` }}
              />
              <span className="text-xs font-mono text-white/50">{label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Hover tooltip ────────────────────────────────────────────────── */}
      {hoveredName && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black/80 border border-orange-500/30 rounded px-3 py-1.5 text-xs font-mono text-orange-300 pointer-events-none whitespace-nowrap">
          {hoveredName}
        </div>
      )}

      {/* ── Entity detail panel (left) ───────────────────────────────────── */}
      {selectedEntity && (
        <div className="absolute left-4 top-16 z-10 w-72 bg-black/85 backdrop-blur border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 pt-3 pb-2 border-b border-white/10 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: `rgb(${COLORS[selectedEntity.type].slice(0, 3).join(",")})`,
                  }}
                />
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                  {selectedEntity.type}
                </span>
              </div>
              <p className="text-sm font-mono font-semibold text-white leading-snug truncate">
                {selectedEntity.name}
              </p>
              {selectedEntity.role && (
                <p className="text-xs text-white/50 mt-0.5 leading-snug">{selectedEntity.role}</p>
              )}
              <p className="text-xs text-white/30 mt-1">
                {selectedEntity.mention_count} mention{selectedEntity.mention_count !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => { setSelectedEntity(null); setEntityDocs([]); }}
              className="text-white/30 hover:text-white/70 text-lg leading-none flex-shrink-0 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
              Source Documents
            </p>

            {docsLoading ? (
              <p className="text-xs text-white/30 font-mono">Loading…</p>
            ) : entityDocs.length === 0 ? (
              <p className="text-xs text-white/30 font-mono">No linked documents found.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {entityDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="border border-white/10 rounded-lg px-3 py-2 hover:border-orange-500/40 hover:bg-orange-500/5 transition-colors">
                      <p className="text-xs font-mono text-orange-400 group-hover:text-orange-300 truncate leading-snug">
                        {doc.filename ?? doc.source_url.split("/").pop() ?? "Document"}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 uppercase tracking-wider">
                        {doc.source}
                      </p>
                      {doc.context && (
                        <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2 italic">
                          "{doc.context}"
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Substory sidebar (right) ──────────────────────────────────────── */}
      <div className="absolute right-0 top-0 bottom-0 z-10 w-80 flex flex-col bg-black/75 backdrop-blur-sm border-l border-white/10 overflow-hidden">
        {selectedSubstory ? (
          <>
            <div className="px-4 py-3 border-b border-orange-500/20 flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => setSelectedSubstory(null)}
                className="text-white/40 hover:text-white text-sm font-mono transition-colors"
                aria-label="Back to stories"
              >
                ←
              </button>
              <p className="text-xs font-mono uppercase tracking-widest text-orange-400 truncate">
                Story
              </p>
              <span className="ml-auto text-xs font-mono text-white/30">
                {totalEntities} entities
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h2 className="text-sm font-mono font-bold text-white leading-snug mb-1">
                {selectedSubstory.title}
              </h2>
              {selectedSubstory.summary && (
                <p className="text-xs text-white/50 italic leading-relaxed mb-4">
                  {selectedSubstory.summary}
                </p>
              )}

              {selectedSubstory.narrative && (
                <div className="space-y-3 mb-5">
                  {selectedSubstory.narrative.split(/\n\n+/).map((para, i) => (
                    <p key={i} className="text-xs text-white/70 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {selectedSubstory.people.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">People</p>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    {selectedSubstory.people.slice(0, 12).join(", ")}
                    {selectedSubstory.people.length > 12 &&
                      ` +${selectedSubstory.people.length - 12}`}
                  </p>
                </div>
              )}
              {selectedSubstory.locations.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">Places</p>
                  <p className="text-xs text-orange-300/80 leading-relaxed">
                    {selectedSubstory.locations.slice(0, 10).join(", ")}
                  </p>
                </div>
              )}
              {selectedSubstory.events.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">Events</p>
                  <p className="text-xs text-purple-300/80 leading-relaxed">
                    {selectedSubstory.events.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">Stories</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-white/30 text-xs font-mono">
                  Loading…
                </div>
              ) : substories.length === 0 ? (
                <div className="px-4 py-8 text-center text-white/30 text-xs font-mono">
                  No stories yet.
                  <br />
                  <code className="text-orange-400">pnpm epstein:substories</code>
                </div>
              ) : (
                substories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubstory(sub);
                      flyToSubstory(sub);
                    }}
                    className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs font-mono text-white leading-snug">{sub.title}</p>
                    {sub.summary && (
                      <p className="text-xs text-white/40 mt-1 leading-snug line-clamp-2">
                        {sub.summary}
                      </p>
                    )}
                    <div className="flex gap-3 mt-1.5 text-xs text-white/30">
                      <span>{sub.doc_count} docs</span>
                      <span>{sub.people.length} people</span>
                      <span>{sub.locations.length} places</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!loading && locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center bg-black/80 border border-white/10 rounded-xl px-8 py-6 max-w-sm">
            <p className="text-orange-400 font-mono text-sm font-bold mb-2">No data yet</p>
            <p className="text-white/50 text-xs leading-relaxed mb-3">
              Run the ingest pipeline to populate the map:
            </p>
            <div className="text-left bg-black/50 rounded-lg p-3 text-xs font-mono text-green-400 space-y-1">
              {["crawl", "ingest", "ner", "geocode", "substories"].map((cmd) => (
                <p key={cmd}>pnpm epstein:{cmd}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
