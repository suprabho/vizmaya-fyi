/**
 * GET /api/epstein/substories
 * Returns substory clusters ordered by doc_count desc.
 */

import { NextResponse } from "next/server";
import { createBrowserClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("epstein_substories")
    .select("id, title, summary, doc_count, people, locations, events")
    .order("doc_count", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
