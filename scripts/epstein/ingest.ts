/**
 * Epstein document ingest: download → extract text → chunk → store
 *
 * Picks up documents with status='pending' from epstein_documents,
 * downloads each PDF, extracts text, splits into ~2000-token chunks,
 * and stores them in epstein_chunks.
 *
 * Usage:
 *   npx tsx scripts/epstein/ingest.ts [--limit 10] [--concurrency 3]
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from "crypto";
import { createServiceClient } from "../../lib/supabase";

// Rough token estimate: 1 token ≈ 4 chars
const TARGET_TOKENS = 2000;
const CHARS_PER_CHUNK = TARGET_TOKENS * 4;
const CHUNK_OVERLAP_CHARS = 200;

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages?: number }> {
  // pdf-parse v2 exposes PDFParse class, not a default function
  const mod = (await import("pdf-parse")) as unknown as {
    PDFParse: new (opts: { data: Uint8Array }) => {
      getText(): Promise<{ text: string; numpages: number }>;
      destroy(): Promise<void>;
    };
  };
  const parser = new mod.PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return { text: result.text ?? "", pages: result.numpages };
  } finally {
    await parser.destroy();
  }
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; EpsteinVizBot/1.0; research purposes)",
      // Age-gate cookie required for justice.gov/epstein documents
      "Cookie": "justiceGovAgeVerified=true",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(`Got HTML instead of file (age gate or redirect?) for ${url}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

function chunkText(
  text: string
): Array<{ text: string; token_count: number; content_hash: string }> {
  // Prefer splitting on paragraph boundaries within the size target
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > CHARS_PER_CHUNK && current.length > 0) {
      chunks.push(current.trim());
      // Overlap: keep last CHUNK_OVERLAP_CHARS of current chunk
      current = current.slice(-CHUNK_OVERLAP_CHARS) + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks
    .filter((c) => c.length > 50)
    .map((text) => ({
      text,
      token_count: Math.round(text.length / 4),
      content_hash: createHash("sha256").update(text).digest("hex"),
    }));
}

// ---------------------------------------------------------------------------
// Process one document
// ---------------------------------------------------------------------------

async function processDocument(
  doc: { id: string; source_url: string; file_type: string | null },
  supabase: ReturnType<typeof createServiceClient>
) {
  console.log(`  Processing: ${doc.source_url}`);

  // Mark as downloading
  await supabase
    .from("epstein_documents")
    .update({ status: "downloading" })
    .eq("id", doc.id);

  let rawText: string;
  let pageCount: number | undefined;

  try {
    const buffer = await downloadBuffer(doc.source_url);

    if (doc.file_type === "pdf" || doc.source_url.endsWith(".pdf")) {
      const { text, pages } = await extractPdfText(buffer);
      rawText = text;
      pageCount = pages;
    } else {
      rawText = buffer.toString("utf-8");
    }
  } catch (err) {
    await supabase
      .from("epstein_documents")
      .update({ status: "failed", error: (err as Error).message })
      .eq("id", doc.id);
    console.warn(`    Failed download/extract: ${(err as Error).message}`);
    return;
  }

  // Store raw text + mark extracted
  await supabase
    .from("epstein_documents")
    .update({
      raw_text: rawText,
      page_count: pageCount ?? null,
      status: "extracted",
      downloaded_at: new Date().toISOString(),
    })
    .eq("id", doc.id);

  // Chunk
  const chunks = chunkText(rawText);
  if (!chunks.length) {
    await supabase
      .from("epstein_documents")
      .update({ status: "chunked" })
      .eq("id", doc.id);
    return;
  }

  // Upsert chunks (ignore duplicates by content_hash)
  const rows = chunks.map((c, i) => ({
    document_id: doc.id,
    chunk_index: i,
    ...c,
  }));

  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await supabase
      .from("epstein_chunks")
      .upsert(rows.slice(i, i + 50), {
        onConflict: "content_hash",
        ignoreDuplicates: true,
      });
    if (error) console.warn(`    Chunk upsert error: ${error.message}`);
  }

  await supabase
    .from("epstein_documents")
    .update({ status: "chunked" })
    .eq("id", doc.id);

  console.log(`    OK — ${pageCount ?? "?"} pages → ${chunks.length} chunks`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(
    args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "10",
    10
  );
  const concurrency = parseInt(
    args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? "3",
    10
  );

  const supabase = createServiceClient();

  const { data: docs, error } = await supabase
    .from("epstein_documents")
    .select("id, source_url, file_type")
    .eq("status", "pending")
    .limit(limit);

  if (error) {
    console.error("Failed to fetch pending documents:", error.message);
    process.exit(1);
  }

  if (!docs?.length) {
    console.log("No pending documents. Run crawl.ts first.");
    return;
  }

  console.log(`Processing ${docs.length} documents (concurrency=${concurrency})...`);

  // Process in batches of `concurrency`
  for (let i = 0; i < docs.length; i += concurrency) {
    const batch = docs.slice(i, i + concurrency);
    await Promise.all(batch.map((doc) => processDocument(doc, supabase)));
  }

  console.log("\nIngest complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
