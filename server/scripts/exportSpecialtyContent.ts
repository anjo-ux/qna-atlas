/**
 * Export one specialty's q-bank content to a JSON file that ships with the repo.
 *
 * Source: DATABASE_URL (the workspace database — where content is authored)
 * Output: server/data/content/<specialty>.content.json
 *
 * The deployment imports this file on startup, which is how content reaches the
 * production database without the workspace needing production credentials.
 *
 *   npm run content:export -- ortho
 *   npm run content:export -- prs
 */
import * as fs from "fs";
import pg from "pg";
import { createHash } from "crypto";
import { isSpecialtyId, type SpecialtyId } from "@shared/specialties";
import {
  CONTENT_FILE_FORMAT,
  computeContentHash,
  contentDir,
  contentFilePath,
  sectionSelectSql,
  type ContentQuestion,
  type ContentSection,
  type ContentSubsection,
  type SpecialtyContentFile,
} from "../content/specialtyContent";

function resolveSpecialty(): SpecialtyId {
  const raw = (process.argv[2] || process.env.SPECIALTY || "").trim().toLowerCase();
  if (!isSpecialtyId(raw)) {
    throw new Error(`Pass a specialty: npm run content:export -- ortho   (got "${raw || "nothing"}")`);
  }
  return raw;
}

function fingerprint(url: string): string {
  try {
    return createHash("sha256").update(new URL(url).hostname).digest("hex").slice(0, 10);
  } catch {
    return "unknown";
  }
}

async function main() {
  const specialtyId = resolveSpecialty();
  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl) throw new Error("DATABASE_URL is required (the workspace database is the source).");

  const source = new pg.Pool({ connectionString: sourceUrl, connectionTimeoutMillis: 20000 });
  try {
    const sectionRows = await source.query<{
      id: string;
      specialty_id: SpecialtyId;
      title: string;
      sort_order: number;
    }>(`SELECT id, specialty_id, title, sort_order FROM sections WHERE ${sectionSelectSql(specialtyId)} ORDER BY sort_order, id`);

    const sectionIds = sectionRows.rows.map((r) => r.id);
    if (sectionIds.length === 0) {
      throw new Error(`No ${specialtyId} sections in the source database — nothing to export.`);
    }

    const subsectionRows = await source.query<{
      id: string;
      section_id: string;
      title: string;
      sort_order: number;
    }>(
      `SELECT id, section_id, title, sort_order FROM subsections
       WHERE section_id = ANY($1::varchar[]) ORDER BY sort_order, id`,
      [sectionIds]
    );
    const subsectionIds = subsectionRows.rows.map((r) => r.id);

    const questionRows = await source.query<{
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
    }>(
      `SELECT id, subsection_id, question, answer, tags, source, visible, reported, flagged, created_at, updated_at
       FROM questions WHERE subsection_id = ANY($1::varchar[]) ORDER BY id`,
      [subsectionIds]
    );

    // Questions carrying the specialty's id prefix but parented outside its sections would
    // be silently dropped, so surface them rather than exporting a quietly short bank.
    const orphans = await source.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM questions
       WHERE ${specialtyId === "ortho" ? "id LIKE 'ortho-%'" : "id NOT LIKE 'ortho-%'"}
         AND NOT (subsection_id = ANY($1::varchar[]))`,
      [subsectionIds]
    );

    const sections: ContentSection[] = sectionRows.rows.map((r) => ({
      id: r.id,
      specialtyId: r.specialty_id ?? specialtyId,
      title: r.title,
      sortOrder: r.sort_order,
    }));
    const subsections: ContentSubsection[] = subsectionRows.rows.map((r) => ({
      id: r.id,
      sectionId: r.section_id,
      title: r.title,
      sortOrder: r.sort_order,
    }));
    const questions: ContentQuestion[] = questionRows.rows.map((r) => ({
      id: r.id,
      subsectionId: r.subsection_id,
      question: r.question,
      answer: r.answer,
      tags: Array.isArray(r.tags) ? r.tags : [],
      source: r.source,
      visible: r.visible,
      reported: r.reported,
      flagged: r.flagged,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));

    const payload: SpecialtyContentFile = {
      formatVersion: CONTENT_FILE_FORMAT,
      specialtyId,
      exportedAt: new Date().toISOString(),
      sourceFingerprint: fingerprint(sourceUrl),
      contentHash: computeContentHash({ sections, subsections, questions }),
      counts: {
        sections: sections.length,
        subsections: subsections.length,
        questions: questions.length,
      },
      sections,
      subsections,
      questions,
    };

    fs.mkdirSync(contentDir(), { recursive: true });
    const outPath = contentFilePath(specialtyId);
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 0)}\n`);

    console.log(
      JSON.stringify(
        {
          specialtyId,
          sourceFingerprint: payload.sourceFingerprint,
          contentHash: payload.contentHash.slice(0, 12),
          ...payload.counts,
          orphanQuestionsSkipped: orphans.rows[0]?.n ?? 0,
          file: outPath,
          sizeMb: +(fs.statSync(outPath).size / 1024 / 1024).toFixed(2),
        },
        null,
        2
      )
    );
  } finally {
    await source.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
