/**
 * Epstein NER pipeline: chunk → Claude extraction → entity upsert
 *
 * Picks up chunks with ner_done=false, runs structured extraction via Claude,
 * and upserts locations/people/events + mention records into Supabase.
 *
 * Usage:
 *   npx tsx scripts/epstein/ner.ts [--limit 50] [--concurrency 5]
 *
 * Environment:
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractedLocation {
  name: string;
  context: string;
  mentioned_by?: string;
}

interface ExtractedPerson {
  name: string;
  role?: string;
  associated_location?: string;
}

interface ExtractedEvent {
  name: string;
  date?: string;
  location?: string;
  description?: string;
}

interface NERResult {
  locations: ExtractedLocation[];
  people: ExtractedPerson[];
  events: ExtractedEvent[];
}

// ---------------------------------------------------------------------------
// Claude extraction
// ---------------------------------------------------------------------------

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an expert analyst extracting structured entities from legal documents related to the Jeffrey Epstein case.

Extract ONLY entities that are clearly mentioned in the text. Do not infer or hallucinate.

For locations: Extract any place names (cities, countries, islands, addresses, properties).
For people: Extract any named individuals. Map each person to their primary associated location/country (e.g., "Donald Trump" → "United States", "Mohammed bin Salman" → "Saudi Arabia").
For events: Extract named events, incidents, legal actions, or notable occurrences. Map each to where it happened.

Be conservative — only include entities with sufficient evidence in the text. Skip vague references.`;

const NER_TOOL: Anthropic.Tool = {
  name: "extract_entities",
  description: "Extract locations, people, and events from the document chunk",
  input_schema: {
    type: "object" as const,
    properties: {
      locations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Place name" },
            context: { type: "string", description: "Surrounding context (1-2 sentences)" },
            mentioned_by: { type: "string", description: "Person who mentioned this location, if identifiable" },
          },
          required: ["name", "context"],
          additionalProperties: false,
        },
      },
      people: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Full name" },
            role: { type: "string", description: "Role or title, if mentioned" },
            associated_location: { type: "string", description: "Primary country/region this person is associated with" },
          },
          required: ["name"],
          additionalProperties: false,
        },
      },
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Event name or description" },
            date: { type: "string", description: "Date or year if mentioned" },
            location: { type: "string", description: "Where this event occurred" },
            description: { type: "string", description: "Brief description (1 sentence)" },
          },
          required: ["name"],
          additionalProperties: false,
        },
      },
    },
    required: ["locations", "people", "events"],
    additionalProperties: false,
  },
};

async function extractEntities(chunkText: string): Promise<NERResult | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",  // Haiku for cost efficiency at scale
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [NER_TOOL],
      tool_choice: { type: "tool", name: "extract_entities" },
      messages: [
        {
          role: "user",
          content: `Extract entities from this document chunk:\n\n${chunkText}`,
        },
      ],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!toolUse) return null;

    return toolUse.input as NERResult;
  } catch (err) {
    console.warn(`    Claude error: ${(err as Error).message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Entity upsert helpers
// ---------------------------------------------------------------------------

type SupabaseClient = ReturnType<typeof createServiceClient>;

async function upsertLocation(
  supabase: SupabaseClient,
  loc: ExtractedLocation
): Promise<string | null> {
  const { data, error } = await supabase
    .from("epstein_locations")
    .upsert(
      { name: loc.name, mention_count: 1 },
      { onConflict: "name", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error) {
    // If conflict, increment count and return existing id
    const { data: existing } = await supabase
      .from("epstein_locations")
      .select("id, mention_count")
      .eq("name", loc.name)
      .single();
    if (existing) {
      await supabase
        .from("epstein_locations")
        .update({ mention_count: (existing.mention_count ?? 0) + 1 })
        .eq("id", existing.id);
      return existing.id;
    }
    return null;
  }
  return data?.id ?? null;
}

async function upsertPerson(
  supabase: SupabaseClient,
  person: ExtractedPerson
): Promise<string | null> {
  const { data, error } = await supabase
    .from("epstein_people")
    .upsert(
      {
        name: person.name,
        role: person.role ?? null,
        associated_location: person.associated_location ?? null,
        mention_count: 1,
      },
      { onConflict: "name", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error) {
    const { data: existing } = await supabase
      .from("epstein_people")
      .select("id, mention_count")
      .eq("name", person.name)
      .single();
    if (existing) {
      await supabase
        .from("epstein_people")
        .update({ mention_count: (existing.mention_count ?? 0) + 1 })
        .eq("id", existing.id);
      return existing.id;
    }
    return null;
  }
  return data?.id ?? null;
}

async function upsertEvent(
  supabase: SupabaseClient,
  event: ExtractedEvent
): Promise<string | null> {
  const { data, error } = await supabase
    .from("epstein_events")
    .upsert(
      {
        name: event.name,
        event_date: event.date ?? null,
        location_name: event.location ?? null,
        mention_count: 1,
      },
      { onConflict: "name", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error) {
    const { data: existing } = await supabase
      .from("epstein_events")
      .select("id, mention_count")
      .eq("name", event.name)
      .single();
    if (existing) {
      await supabase
        .from("epstein_events")
        .update({ mention_count: (existing.mention_count ?? 0) + 1 })
        .eq("id", existing.id);
      return existing.id;
    }
    return null;
  }
  return data?.id ?? null;
}

async function insertMentions(
  supabase: SupabaseClient,
  chunkId: string,
  result: NERResult,
  locationIds: Record<string, string>,
  peopleIds: Record<string, string>,
  eventIds: Record<string, string>
) {
  const mentions: Array<{
    chunk_id: string;
    entity_type: string;
    entity_id: string;
    context: string;
    mentioned_by?: string;
  }> = [];

  for (const loc of result.locations) {
    const id = locationIds[loc.name];
    if (id) {
      mentions.push({
        chunk_id: chunkId,
        entity_type: "location",
        entity_id: id,
        context: loc.context,
        mentioned_by: loc.mentioned_by ?? undefined,
      });
    }
  }

  for (const person of result.people) {
    const id = peopleIds[person.name];
    if (id) {
      mentions.push({
        chunk_id: chunkId,
        entity_type: "person",
        entity_id: id,
        context: "",
      });
    }
  }

  for (const event of result.events) {
    const id = eventIds[event.name];
    if (id) {
      mentions.push({
        chunk_id: chunkId,
        entity_type: "event",
        entity_id: id,
        context: event.description ?? "",
      });
    }
  }

  if (mentions.length) {
    await supabase.from("epstein_mentions").insert(mentions);
  }
}

// ---------------------------------------------------------------------------
// Process one chunk
// ---------------------------------------------------------------------------

async function processChunk(
  chunk: { id: string; text: string },
  supabase: SupabaseClient
) {
  const result = await extractEntities(chunk.text);
  if (!result) {
    await supabase.from("epstein_chunks").update({ ner_done: true }).eq("id", chunk.id);
    return;
  }

  // Upsert all entities in parallel
  const [locationEntries, personEntries, eventEntries] = await Promise.all([
    Promise.all(result.locations.map(async (loc) => [loc.name, await upsertLocation(supabase, loc)] as const)),
    Promise.all(result.people.map(async (p) => [p.name, await upsertPerson(supabase, p)] as const)),
    Promise.all(result.events.map(async (e) => [e.name, await upsertEvent(supabase, e)] as const)),
  ]);

  const locationIds = Object.fromEntries(locationEntries.filter(([, id]) => id));
  const peopleIds = Object.fromEntries(personEntries.filter(([, id]) => id));
  const eventIds = Object.fromEntries(eventEntries.filter(([, id]) => id));

  await insertMentions(supabase, chunk.id, result, locationIds as Record<string, string>, peopleIds as Record<string, string>, eventIds as Record<string, string>);
  await supabase.from("epstein_chunks").update({ ner_done: true }).eq("id", chunk.id);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(
    args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "50",
    10
  );
  const concurrency = parseInt(
    args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? "5",
    10
  );

  const supabase = createServiceClient();

  const { data: chunks, error } = await supabase
    .from("epstein_chunks")
    .select("id, text")
    .eq("ner_done", false)
    .limit(limit);

  if (error) {
    console.error("Failed to fetch chunks:", error.message);
    process.exit(1);
  }

  if (!chunks?.length) {
    console.log("No pending chunks. Run ingest.ts first.");
    return;
  }

  console.log(`Processing ${chunks.length} chunks (concurrency=${concurrency})...`);

  let done = 0;
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (chunk) => {
        await processChunk(chunk, supabase);
        done++;
        process.stdout.write(`\r  ${done}/${chunks.length} chunks processed`);
      })
    );
  }

  console.log("\nNER complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
