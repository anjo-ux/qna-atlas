/**
 * Seed Ortho sections/subsections (specialty_id = ortho) and generate original
 * Atlas-style MCQs from Anki *topic concepts* (never copy Anki stems).
 *
 * Prerequisites:
 *   npm run extract:ortho-topics
 *
 * Usage:
 *   npm run generate:ortho-questions
 *   ORTHO_TARGET_TOTAL=2100 ORTHO_BATCH_SIZE=6 ORTHO_CONCURRENCY=3 npm run generate:ortho-questions
 *   ORTHO_QUESTIONS_PER_SUBSECTION=5  # legacy single-pass mode if ORTHO_TARGET_TOTAL unset and this is set alone
 */
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import OpenAI from "openai";
import { sql, like, eq } from "drizzle-orm";
import { db } from "../db";
import { sections, subsections, questions } from "@shared/schema";
import {
  ORTHO_SPECIALTY_ID,
  orthoSectionOrder,
  orthoSubsectionOrder,
  orthoSubsectionTitles,
  orthoSubsectionToSection,
  type OrthoTopicBucket,
} from "@shared/orthoQuestionImport";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";

const TOPICS_PATH =
  process.env.ORTHO_TOPICS_PATH || path.join(process.cwd(), "server", "data", "orthoTopics.json");

/** Target bank size (resume-aware: only generates the deficit). */
const TARGET_TOTAL = Math.max(
  0,
  parseInt(process.env.ORTHO_TARGET_TOTAL || "2100", 10) || 2100
);
const BATCH_SIZE = Math.min(
  10,
  Math.max(2, parseInt(process.env.ORTHO_BATCH_SIZE || "6", 10) || 6)
);
const CONCURRENCY = Math.min(
  6,
  Math.max(1, parseInt(process.env.ORTHO_CONCURRENCY || "3", 10) || 3)
);
const CONCEPTS_PER_PROMPT = Math.max(
  8,
  parseInt(process.env.ORTHO_CONCEPTS_PER_PROMPT || "14", 10) || 14
);
const MIN_PER_SUBSECTION = Math.max(
  5,
  parseInt(process.env.ORTHO_MIN_PER_SUBSECTION || "20", 10) || 20
);
const MAX_SUBSECTIONS = process.env.ORTHO_MAX_SUBSECTIONS
  ? parseInt(process.env.ORTHO_MAX_SUBSECTIONS, 10)
  : Infinity;
const MODEL = process.env.OPENAI_QUESTION_GENERATION_MODEL || "gpt-4o-mini";

type TopicsFile = {
  buckets: OrthoTopicBucket[];
};

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_QUESTION_GENERATION_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY or OPENAI_QUESTION_GENERATION_API_KEY");
  return new OpenAI({ apiKey });
}

export async function ensureOrthoSectionsAndSubsections(): Promise<void> {
  for (const s of orthoSectionOrder) {
    await db
      .insert(sections)
      .values({
        id: s.id,
        title: s.title,
        sortOrder: s.sortOrder,
        specialtyId: ORTHO_SPECIALTY_ID,
      })
      .onConflictDoUpdate({
        target: sections.id,
        set: {
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
          specialtyId: sql`excluded.specialty_id`,
        },
      });
  }
  for (let i = 0; i < orthoSubsectionOrder.length; i++) {
    const subId = orthoSubsectionOrder[i];
    const sectionId = orthoSubsectionToSection[subId] ?? "ortho-basic-science";
    const title = orthoSubsectionTitles[subId] ?? subId;
    await db
      .insert(subsections)
      .values({ id: subId, sectionId, title, sortOrder: i })
      .onConflictDoUpdate({
        target: subsections.id,
        set: {
          sectionId: sql`excluded.section_id`,
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
        },
      });
  }
}

function pickConcepts(concepts: string[], n: number, offset = 0): string[] {
  if (concepts.length <= n) return [...concepts];
  const start = ((offset % concepts.length) + concepts.length) % concepts.length;
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(concepts[(start + i) % concepts.length]);
  return out;
}

function buildSystemPrompt(subsectionTitle: string, count: number): string {
  return `You are an expert orthopaedic surgery board-exam question writer for Ortho Atlas.
Write ${count} NEW, UNIQUE multiple-choice questions for the subsection: "${subsectionTitle}".

Style (match PRS Atlas / high-quality board banks):
- Rich clinical vignette stems (2–5 sentences): age/sex when relevant, complaint, history, key exam and/or imaging findings, then a judgment question ("Which of the following is the most appropriate next step…?", mechanism, diagnosis, etc.).
- Prefer second- and third-order reasoning (synthesize → diagnose → manage/mechanism). No pure one-line recall.
- Exactly 4 or 5 options on separate lines: A) … B) … C) … D) … (optional E)).
- Answer format: letter on first line as "B)" then a teaching explanation (2–5 sentences). Plausible distractors.

Critical originality rules:
- Topic concepts below are ONLY coverage hints (facts/keywords from a personal study deck).
- Do NOT copy, closely paraphrase, or reuse wording from those hints as the stem.
- Invent original patient scenarios and option wording.
- Do not reference images, photos, "see image", or require a figure.
- Avoid the word "radiographic" in the stem (say "x-ray", "MRI", "CT" instead if needed).
- Each question in the batch must cover a different concept / clinical scenario.

Output: JSON array only (no markdown fences), each object:
{ "question": "...stem...\\nA) ...\\nB) ...", "answer": "B)\\nExplanation...", "tags": ["ortho", "..."] }`;
}

function buildUserPrompt(concepts: string[], count: number, subsectionId: string): string {
  return `Subsection id: ${subsectionId}
Cover orthopaedic concepts from this list (use as topic guidance only; write original vignettes):
${concepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Generate exactly ${count} MCQs as a JSON array.`;
}

function parseGeneratedJson(raw: string): Array<{ question: string; answer: string; tags?: string[] }> {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = JSON.parse(text) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: Array<{ question: string; answer: string; tags?: string[] }> = [];
  for (const item of arr) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as any).question === "string" &&
      typeof (item as any).answer === "string"
    ) {
      out.push({
        question: String((item as any).question).slice(0, 4000),
        answer: String((item as any).answer).slice(0, 2000),
        tags: Array.isArray((item as any).tags)
          ? (item as any).tags.filter((t: unknown): t is string => typeof t === "string").slice(0, 10)
          : undefined,
      });
    }
  }
  return out;
}

function leaksAnkiWording(question: string, concepts: string[]): boolean {
  const q = question.toLowerCase().replace(/\s+/g, " ");
  for (const c of concepts) {
    const ctx = (c.match(/\(([^)]+)\)/)?.[1] || c).toLowerCase();
    const words = ctx.split(/\s+/).filter((w) => w.length > 3);
    if (words.length < 4) continue;
    const window = words.slice(0, 5).join(" ");
    if (window.length >= 16 && q.includes(window)) return true;
  }
  return false;
}

function normalizeForSimilarity(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTooSimilar(generated: string, existing: string[]): boolean {
  const genNorm = normalizeForSimilarity(generated);
  const genWords = new Set(genNorm.split(/\s+/).filter((w) => w.length > 2));
  if (genWords.size < 8) return false;
  for (const ex of existing) {
    const existWords = new Set(normalizeForSimilarity(ex).split(/\s+/).filter((w) => w.length > 2));
    let overlap = 0;
    for (const w of genWords) if (existWords.has(w)) overlap++;
    if (overlap / genWords.size > 0.55) return true;
  }
  return false;
}

function stableQuestionId(subsectionId: string, question: string): string {
  const h = crypto
    .createHash("sha256")
    .update(subsectionId)
    .update("\n")
    .update(question)
    .digest("hex")
    .slice(0, 20);
  return `ortho-q-${h}`;
}

async function countOrthoBySubsection(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      subsectionId: questions.subsectionId,
      n: sql<number>`count(*)::int`,
    })
    .from(questions)
    .where(like(questions.id, "ortho-q-%"))
    .groupBy(questions.subsectionId);
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.subsectionId, Number(r.n));
  return map;
}

async function loadExistingOrthoTexts(subsectionId: string): Promise<string[]> {
  const rows = await db
    .select({ question: questions.question })
    .from(questions)
    .where(eq(questions.subsectionId, subsectionId));
  return rows.map((r) => r.question);
}

/** Allocate integer targets proportional to concept counts, floored by MIN_PER_SUBSECTION. */
function allocateTargets(
  buckets: OrthoTopicBucket[],
  targetTotal: number,
  existing: Map<string, number>
): Map<string, number> {
  const totalConcepts = buckets.reduce((n, b) => n + b.concepts.length, 0) || 1;
  const raw = buckets.map((b) => {
    const proportional = (b.concepts.length / totalConcepts) * targetTotal;
    const floored = Math.max(MIN_PER_SUBSECTION, Math.round(proportional));
    return { id: b.subsectionId, target: floored, concepts: b.concepts.length };
  });
  let sum = raw.reduce((n, r) => n + r.target, 0);
  // Scale down if over target (keep mins as soft floor when possible)
  if (sum > targetTotal) {
    const scale = targetTotal / sum;
    for (const r of raw) r.target = Math.max(MIN_PER_SUBSECTION, Math.round(r.target * scale));
    sum = raw.reduce((n, r) => n + r.target, 0);
  }
  // Distribute remainder to largest concept buckets
  let i = 0;
  const bySize = [...raw].sort((a, b) => b.concepts - a.concepts);
  while (sum < targetTotal && bySize.length > 0) {
    bySize[i % bySize.length].target += 1;
    sum += 1;
    i++;
  }
  const out = new Map<string, number>();
  for (const r of raw) {
    const have = existing.get(r.id) ?? 0;
    out.set(r.id, Math.max(0, r.target - have));
  }
  return out;
}

async function generateBatch(
  openai: OpenAI,
  bucket: OrthoTopicBucket,
  count: number,
  conceptOffset: number,
  existingTexts: string[]
): Promise<{ created: number; skipped: number; texts: string[] }> {
  const title = orthoSubsectionTitles[bucket.subsectionId] ?? bucket.subsectionId;
  const concepts = pickConcepts(bucket.concepts, CONCEPTS_PER_PROMPT, conceptOffset);
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(title, count) },
      { role: "user", content: buildUserPrompt(concepts, count, bucket.subsectionId) },
    ],
    temperature: 0.75,
    max_tokens: 7000,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return { created: 0, skipped: 1, texts: [] };

  let items: Array<{ question: string; answer: string; tags?: string[] }> = [];
  try {
    items = parseGeneratedJson(content);
  } catch (e) {
    console.error(`  parse fail ${bucket.subsectionId}:`, e);
    return { created: 0, skipped: 1, texts: [] };
  }

  let created = 0;
  let skipped = 0;
  const newTexts: string[] = [];
  const seen = [...existingTexts];

  for (const item of items) {
    const fmt = validateQuestionFormat(item.question, item.answer);
    if (!fmt.valid) {
      skipped++;
      continue;
    }
    const rules = contentRulesForGenerated(item.question);
    if (!rules.pass) {
      skipped++;
      continue;
    }
    if (leaksAnkiWording(item.question, concepts)) {
      skipped++;
      continue;
    }
    if (isTooSimilar(item.question, seen)) {
      skipped++;
      continue;
    }
    const id = stableQuestionId(bucket.subsectionId, item.question);
    const tags = Array.from(
      new Set([...(item.tags ?? []), "ortho", "atlas-style", bucket.subsectionId])
    );
    await db
      .insert(questions)
      .values({
        id,
        subsectionId: bucket.subsectionId,
        question: item.question,
        answer: item.answer,
        tags,
        source: "generated",
        visible: true,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          question: sql`excluded.question`,
          answer: sql`excluded.answer`,
          tags: sql`excluded.tags`,
          visible: sql`excluded.visible`,
          updatedAt: new Date(),
        },
      });
    created++;
    seen.push(item.question);
    newTexts.push(item.question);
  }
  return { created, skipped, texts: newTexts };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  if (!fs.existsSync(TOPICS_PATH)) {
    console.error("Topics file missing. Run: npm run extract:ortho-topics");
    console.error("Expected:", TOPICS_PATH);
    process.exit(1);
  }
  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, "utf8")) as TopicsFile;
  if (!topics.buckets?.length) {
    console.error("No topic buckets in", TOPICS_PATH);
    process.exit(1);
  }

  console.log("Seeding Ortho sections/subsections…");
  await ensureOrthoSectionsAndSubsections();

  const openai = getOpenAI();
  const buckets = topics.buckets
    .filter((b) => b.concepts.length > 0)
    .sort((a, b) => b.concepts.length - a.concepts.length)
    .slice(0, Number.isFinite(MAX_SUBSECTIONS) ? MAX_SUBSECTIONS : undefined);

  const existingCounts = await countOrthoBySubsection();
  const currentTotal = [...existingCounts.values()].reduce((a, b) => a + b, 0);
  const deficits = allocateTargets(buckets, TARGET_TOTAL, existingCounts);
  const toCreate = [...deficits.values()].reduce((a, b) => a + b, 0);

  console.log(
    JSON.stringify(
      {
        model: MODEL,
        currentTotal,
        targetTotal: TARGET_TOTAL,
        toCreate,
        batchSize: BATCH_SIZE,
        concurrency: CONCURRENCY,
        subsections: buckets.length,
      },
      null,
      0
    )
  );

  if (toCreate <= 0) {
    console.log("Already at or above target. Nothing to do.");
    return;
  }

  // Build work queue: { bucket, batchCount, offset }
  type Job = { bucket: OrthoTopicBucket; count: number; offset: number; round: number };
  const jobs: Job[] = [];
  for (const bucket of buckets) {
    let need = deficits.get(bucket.subsectionId) ?? 0;
    let round = 0;
    let offset = 0;
    while (need > 0) {
      const count = Math.min(BATCH_SIZE, need);
      jobs.push({ bucket, count, offset, round });
      need -= count;
      offset += CONCEPTS_PER_PROMPT;
      round++;
    }
  }

  console.log(`Queued ${jobs.length} LLM batches…`);

  let created = 0;
  let skipped = 0;
  const textsCache = new Map<string, string[]>();

  // Process in waves of CONCURRENCY, refreshing per-subsection text cache as we go
  await mapPool(jobs, CONCURRENCY, async (job) => {
    const id = job.bucket.subsectionId;
    if (!textsCache.has(id)) {
      textsCache.set(id, await loadExistingOrthoTexts(id));
    }
    const existing = textsCache.get(id)!;
    process.stdout.write(`→ ${id} batch#${job.round + 1} (n=${job.count})… `);
    try {
      const r = await generateBatch(openai, job.bucket, job.count, job.offset, existing);
      created += r.created;
      skipped += r.skipped;
      existing.push(...r.texts);
      console.log(`created=${r.created} skipped=${r.skipped} (session created=${created})`);
    } catch (e) {
      console.error("error", e);
      skipped += job.count;
    }
  });

  const [finalCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(questions)
    .where(like(questions.id, "ortho-q-%"));
  console.log("Done:", { created, skipped, batches: jobs.length, orthoTotal: finalCount?.n });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
