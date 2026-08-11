/**
 * Push all Ortho specialty questions (+ sections/subsections) from local Helium
 * to production Neon.
 *
 * Source: DATABASE_URL (helium)
 * Target: NEON_DATABASE_URL (default) or IMPORT_DATABASE_URL
 *
 *   npm run push:ortho-to-neon
 *   DRY_RUN=1 npm run push:ortho-to-neon
 */
import pg from "pg";
import * as fs from "fs";
import * as path from "path";
import { applyImportDatabaseUrl } from "./importDbTarget";
import {
  ORTHO_SPECIALTY_ID,
  orthoSectionOrder,
  orthoSubsectionOrder,
  orthoSubsectionTitles,
  orthoSubsectionToSection,
} from "@shared/orthoQuestionImport";

const SOURCE_URL = process.env.DATABASE_URL;
if (!SOURCE_URL) throw new Error("DATABASE_URL (Helium source) is required");

const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const BATCH = Math.min(200, Math.max(25, parseInt(process.env.ORTHO_PUSH_BATCH || "100", 10) || 100));

type QuestionRow = {
  id: string;
  subsection_id: string;
  question: string;
  answer: string;
  tags: string[] | null;
  source: string;
  visible: boolean;
  reported: boolean;
  flagged: boolean;
  created_at: Date;
  updated_at: Date;
};

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(unparsed)";
  }
}

async function main() {
  // Resolve target BEFORE importing drizzle modules that read DATABASE_URL.
  // Keep a copy of the Helium URL first.
  const sourceUrl = SOURCE_URL!;
  const sourceHost = hostOf(sourceUrl);

  const target = applyImportDatabaseUrl();
  const targetUrl = process.env.DATABASE_URL!;
  const targetHost = target.host;

  if (sourceHost === targetHost) {
    throw new Error(
      `Refusing to push: source and target are the same host (${sourceHost}). ` +
        `Ensure DATABASE_URL is Helium and NEON_DATABASE_URL is set.`
    );
  }

  console.log(
    JSON.stringify({
      dryRun: DRY_RUN,
      source: { label: "DATABASE_URL (Helium)", host: sourceHost },
      target: { label: target.label, host: targetHost },
      batch: BATCH,
    })
  );

  const source = new pg.Pool({ connectionString: sourceUrl, connectionTimeoutMillis: 20000 });
  const targetPool = new pg.Pool({ connectionString: targetUrl, connectionTimeoutMillis: 30000 });

  try {
    // Ensure multi-specialty + flagged schema on Neon (idempotent; Neon was behind Helium).
    const multiSpecialtySql = fs.readFileSync(
      path.join(process.cwd(), "drizzle", "0016_multi_specialty.sql"),
      "utf8"
    );
    await targetPool.query(multiSpecialtySql);
    await targetPool.query(`
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_questions_flagged ON questions (flagged);
    `);
    console.log("Applied multi-specialty + flagged schema guards on target");

    // Upsert Ortho sections
    for (const s of orthoSectionOrder) {
      if (DRY_RUN) continue;
      await targetPool.query(
        `INSERT INTO sections (id, title, sort_order, specialty_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           sort_order = EXCLUDED.sort_order,
           specialty_id = EXCLUDED.specialty_id`,
        [s.id, s.title, s.sortOrder, ORTHO_SPECIALTY_ID]
      );
    }

    // Upsert Ortho subsections
    for (let i = 0; i < orthoSubsectionOrder.length; i++) {
      const subId = orthoSubsectionOrder[i];
      const sectionId = orthoSubsectionToSection[subId] ?? "ortho-basic-science";
      const title = orthoSubsectionTitles[subId] ?? subId;
      if (DRY_RUN) continue;
      await targetPool.query(
        `INSERT INTO subsections (id, section_id, title, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           section_id = EXCLUDED.section_id,
           title = EXCLUDED.title,
           sort_order = EXCLUDED.sort_order`,
        [subId, sectionId, title, i]
      );
    }

    const countRes = await source.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM questions WHERE id LIKE 'ortho-%'`
    );
    const total = countRes.rows[0]?.n ?? 0;
    console.log(`Source Ortho questions: ${total}`);

    let offset = 0;
    let upserted = 0;
    let insertedGuess = 0;
    let updatedGuess = 0;

    while (offset < total) {
      const { rows } = await source.query<QuestionRow>(
        `SELECT id, subsection_id, question, answer, tags, source, visible, reported, flagged, created_at, updated_at
         FROM questions
         WHERE id LIKE 'ortho-%'
         ORDER BY id
         LIMIT $1 OFFSET $2`,
        [BATCH, offset]
      );
      if (rows.length === 0) break;

      if (!DRY_RUN) {
        // Detect which IDs already exist on target for insert/update accounting
        const ids = rows.map((r) => r.id);
        const existing = await targetPool.query<{ id: string }>(
          `SELECT id FROM questions WHERE id = ANY($1::varchar[])`,
          [ids]
        );
        const existingSet = new Set(existing.rows.map((r) => r.id));

        for (const r of rows) {
          const tags = Array.isArray(r.tags) ? r.tags : [];
          await targetPool.query(
            `INSERT INTO questions (
               id, subsection_id, question, answer, tags, source,
               visible, reported, flagged, created_at, updated_at
             ) VALUES (
               $1, $2, $3, $4, $5::jsonb, $6,
               $7, $8, $9, $10, $11
             )
             ON CONFLICT (id) DO UPDATE SET
               subsection_id = EXCLUDED.subsection_id,
               question = EXCLUDED.question,
               answer = EXCLUDED.answer,
               tags = EXCLUDED.tags,
               source = EXCLUDED.source,
               visible = EXCLUDED.visible,
               reported = EXCLUDED.reported,
               flagged = EXCLUDED.flagged,
               updated_at = EXCLUDED.updated_at`,
            [
              r.id,
              r.subsection_id,
              r.question,
              r.answer,
              JSON.stringify(tags),
              r.source,
              r.visible,
              r.reported,
              r.flagged,
              r.created_at,
              r.updated_at,
            ]
          );
          if (existingSet.has(r.id)) updatedGuess++;
          else insertedGuess++;
          upserted++;
        }
      } else {
        upserted += rows.length;
      }

      offset += rows.length;
      if (offset % (BATCH * 5) === 0 || offset >= total) {
        console.log(`progress ${offset}/${total}`);
      }
    }

    // Verify target
    const verify = await targetPool.query(`
      SELECT
        count(*) FILTER (WHERE id LIKE 'ortho-%')::int AS ortho_total,
        count(*) FILTER (WHERE id LIKE 'ortho-%' AND visible AND NOT flagged)::int AS ortho_live,
        count(*) FILTER (WHERE id LIKE 'ortho-%' AND flagged)::int AS ortho_flagged
      FROM questions`);
    const secs = await targetPool.query(`SELECT count(*)::int AS n FROM sections WHERE id LIKE 'ortho-%'`);
    const subs = await targetPool.query(`SELECT count(*)::int AS n FROM subsections WHERE id LIKE 'ortho-%'`);

    console.log(
      JSON.stringify(
        {
          dryRun: DRY_RUN,
          upserted,
          insertedGuess,
          updatedGuess,
          targetVerify: verify.rows[0],
          targetOrthoSections: secs.rows[0].n,
          targetOrthoSubsections: subs.rows[0].n,
        },
        null,
        2
      )
    );
  } finally {
    await source.end();
    await targetPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
