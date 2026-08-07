/**
 * Seed Ortho sections/subsections (specialty_id = ortho) and generate original
 * Atlas-style MCQs from Anki *topic concepts* (never copy Anki stems).
 *
 * Prerequisites:
 *   npm run extract:ortho-topics
 *
 * Usage:
 *   npm run generate:ortho-questions
 *   ORTHO_QUESTIONS_PER_SUBSECTION=4 ORTHO_MAX_SUBSECTIONS=10 npm run generate:ortho-questions
 */
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import OpenAI from "openai";
import { sql } from "drizzle-orm";
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

const QUESTIONS_PER_SUBSECTION = Math.max(
  1,
  parseInt(process.env.ORTHO_QUESTIONS_PER_SUBSECTION || "5", 10) || 5
);
const MAX_SUBSECTIONS = process.env.ORTHO_MAX_SUBSECTIONS
  ? parseInt(process.env.ORTHO_MAX_SUBSECTIONS, 10)
  : Infinity;
const CONCEPTS_PER_PROMPT = 12;
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

function pickConcepts(concepts: string[], n: number): string[] {
  if (concepts.length <= n) return [...concepts];
  // Stable-ish sample: shuffle copy with seeded-ish hash of first concept
  const copy = [...concepts];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
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

/** Reject if generated text shares too many consecutive words with a concept hint. */
function leaksAnkiWording(question: string, concepts: string[]): boolean {
  const q = question.toLowerCase().replace(/\s+/g, " ");
  for (const c of concepts) {
    // Use the parenthetical context part if present — that's closest to Anki prompt wording
    const ctx = (c.match(/\(([^)]+)\)/)?.[1] || c).toLowerCase();
    const words = ctx.split(/\s+/).filter((w) => w.length > 3);
    if (words.length < 4) continue;
    const window = words.slice(0, 5).join(" ");
    if (window.length >= 16 && q.includes(window)) return true;
  }
  return false;
}

function stableQuestionId(subsectionId: string, question: string): string {
  const h = crypto.createHash("sha256").update(subsectionId).update("\n").update(question).digest("hex").slice(0, 20);
  return `ortho-q-${h}`;
}

async function generateForSubsection(
  openai: OpenAI,
  bucket: OrthoTopicBucket
): Promise<{ created: number; skipped: number }> {
  const title = orthoSubsectionTitles[bucket.subsectionId] ?? bucket.subsectionId;
  const concepts = pickConcepts(bucket.concepts, CONCEPTS_PER_PROMPT);
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(title, QUESTIONS_PER_SUBSECTION) },
      { role: "user", content: buildUserPrompt(concepts, QUESTIONS_PER_SUBSECTION, bucket.subsectionId) },
    ],
    temperature: 0.7,
    max_tokens: 6000,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return { created: 0, skipped: 1 };

  let items: Array<{ question: string; answer: string; tags?: string[] }> = [];
  try {
    items = parseGeneratedJson(content);
  } catch (e) {
    console.error(`  parse fail ${bucket.subsectionId}:`, e);
    return { created: 0, skipped: 1 };
  }

  let created = 0;
  let skipped = 0;
  for (const item of items) {
    const fmt = validateQuestionFormat(item.question, item.answer);
    if (!fmt.valid) {
      console.warn(`  skip format: ${fmt.errors.join("; ")}`);
      skipped++;
      continue;
    }
    const rules = contentRulesForGenerated(item.question);
    if (!rules.pass) {
      console.warn(`  skip content: ${rules.reason}`);
      skipped++;
      continue;
    }
    if (leaksAnkiWording(item.question, concepts)) {
      console.warn(`  skip possible Anki wording leak`);
      skipped++;
      continue;
    }
    const id = stableQuestionId(bucket.subsectionId, item.question);
    const tags = Array.from(new Set([...(item.tags ?? []), "ortho", "atlas-style", bucket.subsectionId]));
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
  }
  return { created, skipped };
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

  console.log(
    `Generating ~${QUESTIONS_PER_SUBSECTION} questions × ${buckets.length} subsections (model=${MODEL})…`
  );

  let created = 0;
  let skipped = 0;
  for (const bucket of buckets) {
    process.stdout.write(`→ ${bucket.subsectionId} (${bucket.concepts.length} concepts)… `);
    try {
      const r = await generateForSubsection(openai, bucket);
      created += r.created;
      skipped += r.skipped;
      console.log(`created=${r.created} skipped=${r.skipped}`);
    } catch (e) {
      console.error("error", e);
      skipped++;
    }
  }
  console.log("Done:", { created, skipped, subsections: buckets.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
