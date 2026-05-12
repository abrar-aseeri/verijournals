// Writes one row to public.source_snapshots before importer processing.
// Part of the Technical Conduit evidence chain — the snapshot proves
// "on date X, source Y returned content with hash H". The table is
// append-only for authenticated/anon roles (RLS allows SELECT only);
// service_role bypasses RLS and is the only writer.

import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'

export function sha256Hex(content) {
  return createHash('sha256').update(content).digest('hex')
}

// Snapshot a downloaded file (CSV/text). Reads the file, computes a SHA-256
// hash, captures the byte size, and inserts a single source_snapshots row.
// `extra` is merged into response_raw alongside file metadata.
// Throws on insert failure — refusing to proceed without evidence is the
// whole point of the conduit pattern.
export async function snapshotFile(supabase, { sourceName, filePath, queryUrl, extra = {} }) {
  const buf = readFileSync(filePath)
  const hash = sha256Hex(buf)
  const stats = statSync(filePath)
  const payload = {
    source_name: sourceName,
    query_url: queryUrl,
    response_raw: {
      ...extra,
      file_path: filePath,
      file_bytes: stats.size,
    },
    response_hash: hash,
    http_status: 200,
  }
  const { data, error } = await supabase
    .from('source_snapshots')
    .insert(payload)
    .select('id, fetched_at')
    .single()
  if (error) throw new Error(`source_snapshots insert failed (${sourceName}): ${error.message}`)
  console.log(`source_snapshots: ${sourceName} → id=${data.id} hash=${hash.slice(0, 12)}…`)
  return data
}

// Snapshot the start of an API-based import. No single file to hash, so
// we record intent + base URL only. The per-page evidence still lives in
// the upstream API's own logs (Crossref / OpenAlex / etc. are themselves
// the primary record). Pair with the automation_runs entry that captures
// completion summary.
export async function snapshotApiRun(supabase, { sourceName, queryUrl, extra = {} }) {
  const payload = {
    source_name: sourceName,
    query_url: queryUrl,
    response_raw: { intent: 'import_started', ...extra },
    response_hash: null,
    http_status: null,
  }
  const { data, error } = await supabase
    .from('source_snapshots')
    .insert(payload)
    .select('id, fetched_at')
    .single()
  if (error) throw new Error(`source_snapshots insert failed (${sourceName}): ${error.message}`)
  console.log(`source_snapshots: ${sourceName} → id=${data.id} (API run start)`)
  return data
}
