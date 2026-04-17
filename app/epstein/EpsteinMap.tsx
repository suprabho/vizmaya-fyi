"use client";

import { useEffect, useState, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map } from "react-map-gl/mapbox";
import { DeckGL } from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
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

interface Substory {
  id: string;
  title: string;
  summary: string;
  doc_count: number;
  people: string[];
  locations: string[];
  events: string[];
}

type LayerMode = "heatmap" | "points" | "people";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EpsteinMap() {

  const [viewState, setViewState] = useState({
    longitude: -95,
    latitude: 38,
    zoom: 3.8,
    pitch: 0,
    bearing: 0,
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [substories, setSubstories] = useState<Substory[]>([]);
  const [selectedSubstory, setSelectedSubstory] = useState<Substory | null>(null);
  const [layerMode, setLayerMode] = useState<LayerMode>("heatmap");
  const [loading, setLoading] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch("/api/epstein/entities?type=all&limit=2000").then((r) => r.json()),
      fetch("/api/epstein/substories").then((r) => r.json()),
    ])
      .then(([entities, subs]) => {
        setLocations(entities.locations ?? []);
        setPeople(entities.people ?? []);
        setSubstories(subs ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter locations by selected substory
  const activeLocations = selectedSubstory
    ? locations.filter((l) =>
        selectedSubstory.locations.includes(l.canonical_name ?? l.name) ||
        selectedSubstory.locations.includes(l.name)
      )
    : locations;

  // ---------------------------------------------------------------------------
  // Deck.gl layers
  // ---------------------------------------------------------------------------

  const maxMentions = Math.max(...activeLocations.map((l) => l.mention_count), 1);

  const heatmapLayer = new HeatmapLayer<Location>({
    id: "location-heatmap",
    data: activeLocations,
    getPosition: (d) => [d.lng, d.lat],
    getWeight: (d) => d.mention_count,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.03,
    colorRange: [
      [0, 0, 40, 0],
      [20, 0, 80, 128],
      [80, 0, 120, 200],
      [160, 0, 80, 220],
      [220, 40, 20, 240],
      [255, 140, 0, 255],
    ],
    visible: layerMode === "heatmap",
  });

  const pointsLayer = new ScatterplotLayer<Location>({
    id: "location-points",
    data: activeLocations,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: (d) => Math.sqrt(d.mention_count / maxMentions) * 40000 + 5000,
    getFillColor: (d) => {
      const t = d.mention_count / maxMentions;
      return [255 * t, 80 * (1 - t), 20, 200];
    },
    getLineColor: [255, 255, 255, 80],
    lineWidthMinPixels: 1,
    stroked: true,
    pickable: true,
    onHover: ({ object }) => setHoveredEntity(object ? (object.canonical_name ?? object.name) : null),
    visible: layerMode === "points",
    radiusUnits: "meters",
  });

  const labelLayer = new TextLayer<Location>({
    id: "location-labels",
    data: activeLocations.filter((l) => l.lat && l.lng),
    getPosition: (d) => [d.lng, d.lat],
    getText: (d) => d.canonical_name ?? d.name,
    getSize: (d) => Math.min(8 + Math.sqrt(d.mention_count), 18),
    getColor: [255, 255, 255, 200],
    getBackgroundColor: [0, 0, 0, 140],
    background: true,
    backgroundPadding: [3, 2, 3, 2],
    fontFamily: "monospace",
    visible: layerMode === "points",
  });

  const layers = [heatmapLayer, pointsLayer, labelLayer];

  // ---------------------------------------------------------------------------
  // Fly to substory locations
  // ---------------------------------------------------------------------------

  const flyToSubstory = useCallback((sub: Substory) => {
    const relevant = locations.filter(
      (l) => sub.locations.includes(l.canonical_name ?? l.name) || sub.locations.includes(l.name)
    );
    if (!relevant.length) return;
    const lngs = relevant.map((l) => l.lng);
    const lats = relevant.map((l) => l.lat);
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    setViewState((v) => ({ ...v, longitude: centerLng, latitude: centerLat, zoom: 3 }));
  }, [locations]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* Map */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as typeof viewState)}
        controller={true}
        layers={layers}
        style={{ position: "absolute", top: "0", right: "0", bottom: "0", left: "0" }}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        />
      </DeckGL>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-widest uppercase text-orange-400">
            Epstein Document Map
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            {loading ? "Loading…" : `${locations.length} locations · ${people.length} people · ${substories.length} substories`}
          </p>
        </div>

        {/* Layer toggle */}
        <div className="pointer-events-auto flex gap-1 bg-black/60 border border-white/10 rounded-full p-1">
          {(["heatmap", "points"] as LayerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                layerMode === mode
                  ? "bg-orange-500 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredEntity && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-black/80 border border-orange-500/30 rounded px-3 py-1.5 text-xs font-mono text-orange-300 pointer-events-none">
          {hoveredEntity}
        </div>
      )}

      {/* Substory sidebar */}
      <div className="absolute right-0 top-0 bottom-0 z-10 w-72 flex flex-col bg-black/70 backdrop-blur-sm border-l border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-mono uppercase tracking-widest text-white/40">Substories</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-white/30 text-xs font-mono">
              Loading substories…
            </div>
          ) : substories.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-xs font-mono">
              No substories yet.<br />Run <code className="text-orange-400">pnpm epstein:substories</code>
            </div>
          ) : (
            substories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  const next = selectedSubstory?.id === sub.id ? null : sub;
                  setSelectedSubstory(next);
                  if (next) flyToSubstory(next);
                }}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                  selectedSubstory?.id === sub.id
                    ? "bg-orange-500/10 border-l-2 border-l-orange-500"
                    : "hover:bg-white/5"
                }`}
              >
                <p className="text-xs font-mono text-white leading-snug">{sub.title}</p>
                {sub.summary && (
                  <p className="text-xs text-white/40 mt-1 leading-snug line-clamp-2">{sub.summary}</p>
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

        {/* Selected substory detail */}
        {selectedSubstory && (
          <div className="border-t border-orange-500/20 bg-orange-500/5 px-4 py-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-mono font-bold text-orange-400 mb-2">
              {selectedSubstory.title}
            </p>
            {selectedSubstory.people.length > 0 && (
              <div className="mb-1.5">
                <p className="text-xs text-white/30 mb-0.5">People</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  {selectedSubstory.people.slice(0, 8).join(", ")}
                  {selectedSubstory.people.length > 8 && ` +${selectedSubstory.people.length - 8} more`}
                </p>
              </div>
            )}
            {selectedSubstory.locations.length > 0 && (
              <div>
                <p className="text-xs text-white/30 mb-0.5">Locations</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  {selectedSubstory.locations.slice(0, 6).join(", ")}
                </p>
              </div>
            )}
            <button
              onClick={() => setSelectedSubstory(null)}
              className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Clear filter ×
            </button>
          </div>
        )}
      </div>

      {/* Empty state overlay */}
      {!loading && locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center bg-black/80 border border-white/10 rounded-xl px-8 py-6 max-w-sm">
            <p className="text-orange-400 font-mono text-sm font-bold mb-2">No data yet</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Run the ingest pipeline to populate the map:
            </p>
            <div className="mt-3 text-left bg-black/50 rounded-lg p-3 text-xs font-mono text-green-400 space-y-1">
              <p>pnpm epstein:crawl</p>
              <p>pnpm epstein:ingest</p>
              <p>pnpm epstein:ner</p>
              <p>pnpm epstein:geocode</p>
              <p>pnpm epstein:substories</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
