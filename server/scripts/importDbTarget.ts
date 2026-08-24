/**
 * Resolve which Postgres URL question-import scripts should write to.
 *
 * The target must be stated explicitly. There is deliberately no default: the
 * scripts used to fall back to NEON_DATABASE_URL and call it "production", but the
 * deployment reads whatever DATABASE_URL its own secrets provide. Ortho content was
 * pushed to Neon and reported success while the live site stayed empty, so guessing
 * a target is now a hard error instead of a silent misfire.
 *
 * Pick one:
 *   IMPORT_DATABASE_URL=postgresql://...   — explicit target (use the deployment's DATABASE_URL)
 *   IMPORT_DB=local                        — the workspace database (DATABASE_URL)
 *   IMPORT_DB=neon                         — the legacy Neon copy (NEON_DATABASE_URL)
 */
export function applyImportDatabaseUrl(): { label: string; host: string } {
  const explicit = process.env.IMPORT_DATABASE_URL?.trim();
  const mode = process.env.IMPORT_DB?.trim().toLowerCase();

  let url: string | undefined;
  let label: string;

  if (explicit) {
    url = explicit;
    label = "IMPORT_DATABASE_URL";
  } else if (mode === "local") {
    url = process.env.DATABASE_URL;
    label = "DATABASE_URL (IMPORT_DB=local)";
  } else if (mode === "neon") {
    url = process.env.NEON_DATABASE_URL;
    label = "NEON_DATABASE_URL (IMPORT_DB=neon)";
  } else if (mode) {
    throw new Error(
      `Unrecognized IMPORT_DB=${mode}. Use IMPORT_DB=local, IMPORT_DB=neon, or set IMPORT_DATABASE_URL.`,
    );
  } else {
    throw new Error(
      "No import target specified. This script refuses to guess because writing to the " +
        "wrong database looks like success. Set one of:\n" +
        "  IMPORT_DATABASE_URL=postgresql://...  (the deployment's DATABASE_URL — check Deployments > Secrets)\n" +
        "  IMPORT_DB=local                       (the workspace database)\n" +
        "  IMPORT_DB=neon                        (the legacy Neon copy)",
    );
  }

  if (!url) {
    throw new Error(`Import target "${label}" resolved to an empty URL. Check that the variable is set.`);
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
