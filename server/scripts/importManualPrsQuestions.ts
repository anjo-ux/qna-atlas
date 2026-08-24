/**
 * Import a curated PRS question batch from server/data/prsManualBatchRaw.txt
 * into the live question bank with subsection tags from section headers.
 *
 * The target database must be stated explicitly (see importDbTarget.ts).
 *
 * Usage:
 *   IMPORT_DATABASE_URL=postgresql://... npm run import:prs-manual -- --dry-run
 *   IMPORT_DATABASE_URL=postgresql://... npm run import:prs-manual
 *   IMPORT_DB=local npm run import:prs-manual          # workspace database
 */
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { questions } from "@shared/schema";
import { validateQuestionFormat } from "@shared/questionFormat";
import { sql } from "drizzle-orm";
import { applyImportDatabaseUrl } from "./importDbTarget";

const RAW_PATH = path.join(process.cwd(), "server/data/prsManualBatchRaw.txt");
const DRY_RUN = process.argv.includes("--dry-run");
const SOURCE = "imported";
const ID_PREFIX = "prs-manual-2026-08-";

const SECTION_TO_SUBSECTION: Record<string, string> = {
  "Vascular Anomalies": "vascular-anomalies",
  Infection: "infections",
  "Congenital and Pediatric Hand": "congenital-pediatric-hand",
  "Facial Fractures": "facial-fractures",
  "Facial Paralysis": "facial-paralysis",
  "Eye Aesthetic and Reconstructive": "eye-aesthetic-reconstructive",
  "Perioperative Care": "perioperative-care",
  "Critical Care": "critical-care",
  Trauma: "trauma",
  Transplantation: "transplantation",
};

/** Standalone titled items (1–7) before the first section header. */
const STANDALONE_SUBSECTION: Record<string, string> = {
  "Pediatric Ganglion": "hand-tumors",
  "Blood Supply Relevant to Labiaplasty": "gender-affirming-surgery",
  "Cephalometric Landmarks (Porion and Gonion)": "mandible-dental-orthognathic",
  "Mondor Syndrome": "breast-reduction-mastopexy",
  "Interval for Locating the Superficial Branch of the Radial Nerve": "hand-nerves",
  "Plane of Upper Eyelid Weight Placement": "facial-paralysis",
  "Saddle Nose Deformity": "rhinoplasty",
};

type ParsedQuestion = {
  title: string;
  subsectionId: string;
  question: string;
  answer: string;
  tags: string[];
};

function normalizeWhitespace(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

/** Split inline "A) ... B) ... C) ..." into one option per line. */
function formatChoicesOntoLines(stemAndChoices: string): string {
  const text = stemAndChoices.trim();
  // Already multi-line choices?
  const lines = text.split("\n");
  const choiceLineCount = lines.filter((l) => /^\s*[A-E]\)\s+\S/.test(l)).length;
  if (choiceLineCount >= 3) {
    return lines
      .map((l) => {
        const m = l.match(/^\s*([A-E])\)\s*(.*)$/);
        if (m) return `${m[1]}) ${m[2].replace(/\s+/g, " ").trim()}`;
        return l.trimEnd();
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Find first A) that starts the option block (after the stem).
  const optMatch = text.match(/\n?\s*([A-E]\))\s+/);
  if (!optMatch || optMatch.index == null) return text;

  const stem = text.slice(0, optMatch.index).trim();
  const optionsBlob = text.slice(optMatch.index).trim();

  // Split on A)|B)|C)|D)|E) at start or after space
  const parts = optionsBlob.split(/(?=\b[A-E]\))\s*/).filter(Boolean);
  const formatted = parts
    .map((p) => {
      const m = p.match(/^([A-E])\)\s*(.+)$/s);
      if (!m) return p.trim();
      return `${m[1]}) ${m[2].replace(/\s+/g, " ").trim()}`;
    })
    .join("\n");

  return `${stem}\n${formatted}`.trim();
}

function splitQuestionAndAnswer(block: string): { question: string; answer: string; letter: string } | null {
  const m = block.match(
    /The correct response is Option\s+([A-E])\.\s*/i
  );
  if (!m || m.index == null) return null;
  const letter = m[1].toUpperCase();
  const questionPart = block.slice(0, m.index).trim();
  const explanation = block.slice(m.index + m[0].length).trim();
  const question = formatChoicesOntoLines(questionPart);
  const answer = `The correct response is Option ${letter}.\n\n${explanation}`.trim();
  return { question, answer, letter };
}

function parseRaw(raw: string): ParsedQuestion[] {
  const text = normalizeWhitespace(raw);
  const lines = text.split("\n");

  type Marker = { line: number; kind: "standalone" | "section" | "question"; label: string };
  const markers: Marker[] = [];

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].trim();
    const standalone = L.match(/^(\d+)\.\s+(.+)$/);
    if (standalone && standalone[2].length < 120 && !L.includes("?")) {
      // Only treat as title if next content looks like a vignette (not a choice)
      markers.push({ line: i, kind: "standalone", label: standalone[2].trim() });
      continue;
    }
    if (SECTION_TO_SUBSECTION[L]) {
      markers.push({ line: i, kind: "section", label: L });
      continue;
    }
    if (/^Question\s+\d+$/i.test(L)) {
      markers.push({ line: i, kind: "question", label: L });
    }
  }

  // Drop false-positive "standalone" markers that appear after section content started
  // (e.g. numbered lists inside explanations). Keep only those before first section,
  // or whose label is in STANDALONE_SUBSECTION.
  const firstSectionIdx = markers.findIndex((m) => m.kind === "section");
  const cleaned = markers.filter((m, idx) => {
    if (m.kind !== "standalone") return true;
    if (STANDALONE_SUBSECTION[m.label]) return true;
    if (firstSectionIdx >= 0 && idx < firstSectionIdx) return true;
    return false;
  });

  const out: ParsedQuestion[] = [];
  let currentSection: string | null = null;

  for (let mi = 0; mi < cleaned.length; mi++) {
    const m = cleaned[mi];
    if (m.kind === "section") {
      currentSection = m.label;
      continue;
    }

    const start = m.line + 1;
    const end = mi + 1 < cleaned.length ? cleaned[mi + 1].line : lines.length;
    const block = lines.slice(start, end).join("\n").trim();
    if (!block) continue;

    const split = splitQuestionAndAnswer(block);
    if (!split) {
      console.warn(`Could not split Q/A for marker at line ${m.line}: ${m.label}`);
      continue;
    }

    let subsectionId: string;
    let title: string;
    if (m.kind === "standalone") {
      subsectionId = STANDALONE_SUBSECTION[m.label];
      if (!subsectionId) {
        console.warn(`No subsection mapping for standalone: ${m.label}`);
        continue;
      }
      title = m.label;
    } else {
      if (!currentSection) {
        console.warn(`Question without section at line ${m.line}`);
        continue;
      }
      subsectionId = SECTION_TO_SUBSECTION[currentSection];
      title = `${currentSection} ${m.label}`;
    }

    const tags = [subsectionId, "manual-batch-2026-08"];
    out.push({
      title,
      subsectionId,
      question: split.question,
      answer: split.answer,
      tags,
    });
  }

  return out;
}

function stableId(subsectionId: string, question: string, index: number): string {
  const h = createHash("sha1").update(`${subsectionId}\n${question}`).digest("hex").slice(0, 12);
  return `${ID_PREFIX}${String(index + 1).padStart(3, "0")}-${h}`;
}

async function main() {
  const target = applyImportDatabaseUrl();
  // Load db only after DATABASE_URL has been pointed at the import target (Neon by default).
  const { db, pool } = await import("../db");

  console.log(`Import target: ${target.label} @ ${target.host}`);

  try {
    if (!fs.existsSync(RAW_PATH)) {
      console.error("Raw file not found:", RAW_PATH);
      process.exit(1);
    }
    const raw = fs.readFileSync(RAW_PATH, "utf8");
    const parsed = parseRaw(raw);
    console.log(`Parsed ${parsed.length} questions`);

    const bySub: Record<string, number> = {};
    let invalid = 0;
    for (const q of parsed) {
      bySub[q.subsectionId] = (bySub[q.subsectionId] ?? 0) + 1;
      const v = validateQuestionFormat(q.question, q.answer);
      if (!v.valid) {
        invalid++;
        console.warn(`INVALID [${q.title}]:`, v.errors.join("; "));
        console.warn("Q preview:", q.question.slice(0, 200).replace(/\n/g, " | "));
      }
    }
    console.log("By subsection:", bySub);
    if (invalid > 0) {
      console.error(`${invalid} questions failed format validation; aborting import.`);
      process.exit(1);
    }

    if (DRY_RUN) {
      console.log("Dry run — no DB writes.");
      const s = parsed[0];
      console.log("\nSample:", s.title, "→", s.subsectionId);
      console.log(s.question.slice(0, 400));
      console.log("---");
      console.log(s.answer.slice(0, 300));
      process.exit(0);
    }

    const existingSubs = await db.execute(sql`select id from subsections`);
    const subIds = new Set((existingSubs.rows as { id: string }[]).map((r) => r.id));
    for (const id of Object.values({ ...SECTION_TO_SUBSECTION, ...STANDALONE_SUBSECTION })) {
      if (!subIds.has(id)) {
        console.error("Missing subsection in DB:", id);
        process.exit(1);
      }
    }

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      const id = stableId(q.subsectionId, q.question, i);
      try {
        await db
          .insert(questions)
          .values({
            id,
            subsectionId: q.subsectionId,
            question: q.question,
            answer: q.answer,
            tags: q.tags,
            source: SOURCE,
            visible: true,
          })
          .onConflictDoNothing({ target: questions.id });
        inserted++;
      } catch (e) {
        skipped++;
        console.warn("Insert failed for", id, e);
      }
    }

    const counted = await db.execute(
      sql`select count(*)::int as c from questions where id like ${ID_PREFIX + "%"}`
    );
    console.log(`Insert attempted: ${inserted}, failed: ${skipped}`);
    console.log(`Rows with prefix ${ID_PREFIX}:`, (counted.rows as { c: number }[])[0]?.c);
  } finally {
    await pool.end().catch(() => undefined);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
