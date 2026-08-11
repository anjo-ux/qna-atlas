/**
 * Resolve which Postgres URL question-import scripts should use.
 *
 * Default: NEON_DATABASE_URL (production).
 * Overrides:
 *   IMPORT_DATABASE_URL=postgresql://...   — explicit URL
 *   IMPORT_DB=local                        — use DATABASE_URL (Replit helium)
 */
export function applyImportDatabaseUrl(): { label: string; host: string } {
  const explicit = process.env.IMPORT_DATABASE_URL?.trim();
  const preferLocal = process.env.IMPORT_DB === "local";

  let url: string | undefined;
  let label: string;

  if (explicit) {
    url = explicit;
    label = "IMPORT_DATABASE_URL";
  } else if (preferLocal) {
    url = process.env.DATABASE_URL;
    label = "DATABASE_URL (local via IMPORT_DB=local)";
  } else if (process.env.NEON_DATABASE_URL) {
    url = process.env.NEON_DATABASE_URL;
    label = "NEON_DATABASE_URL (default)";
  } else {
    url = process.env.DATABASE_URL;
    label = "DATABASE_URL (fallback; NEON_DATABASE_URL unset)";
  }

  if (!url) {
    throw new Error(
      "No database URL available. Set NEON_DATABASE_URL (preferred) or DATABASE_URL."
    );
  }

  process.env.DATABASE_URL = url;

  let host = "(unparsed)";
  try {
    host = new URL(url).host;
  } catch {
    /* ignore */
  }

  return { label, host };
}
