/**
 * Slightly rephrase every visible question (and its answer) using different wording.
 * Uses OpenAI to paraphrase while preserving meaning, correct answer, and format.
 *
 * Usage:
 *   npx tsx server/scripts/rephraseQuestions.ts           # run (updates DB)
 *   npx tsx server/scripts/rephraseQuestions.ts --dry-run # preview only
 *   npx tsx server/scripts/rephraseQuestions.ts --batch-size 10
 *
 * Requires: OPENAI_API_KEY or OPENAI_QUESTION_GENERATION_API_KEY
 */
import OpenAI from "openai";
import { db } from "../db";
import { questions } from "@shared/schema";
import { storage } from "../storage";
import { validateQuestionFormat } from "@shared/questionFormat";
import { eq, asc } from "drizzle-orm";

const DEFAULT_BATCH_SIZE = 5;
const DELAY_MS_BETWEEN_BATCHES = 1500;

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_QUESTION_GENERATION_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function parseRephrasedBatch(raw: string): { question: string; answer: string }[] {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = JSON.parse(text) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: { question: string; answer: string }[] = [];
  for (const item of arr) {
    if (item && typeof item === "object" && typeof item.question === "string" && typeof item.answer === "string") {
      out.push({
        question: String(item.question).trim(),
        answer: String(item.answer).trim(),
      });
    }
  }
  return out;
}

function buildRephrasePrompt(batch: { id: string; question: string; answer: string }[]): string {
  const items = batch
    .map(
      (q, i) =>
        `[${i + 1}]\nQuestion:\n${q.question}\n\nAnswer:\n${q.answer}`
    )
    .join("\n\n---\n\n");
  return `Rephrase each of the following multiple-choice questions and their answers to use different wording while keeping the exact same meaning, the same correct answer letter, and the same structure.

Rules:
- Change wording throughout: question stem, each option (A, B, C, D, etc.), and the answer explanation.
- Preserve: number of choices, correct answer letter, and format. Answer must start with "X)\\n" then the explanation.
- Output a JSON array of exactly ${batch.length} objects with keys "question" and "answer", in the same order as the input.

Input:

${items}

Respond with only the JSON array, no other text.`;
}

async function rephraseBatch(
  openai: OpenAI,
  batch: { id: string; question: string; answer: string }[]
): Promise<{ question: string; answer: string }[]> {
  const model = process.env.OPENAI_QUESTION_GENERATION_MODEL || "gpt-4o-mini";
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You rephrase multiple-choice questions and answers. Output only valid JSON: an array of objects with keys question and answer. Preserve meaning, correct answer letter, and format (A), B), etc.; answer starts with letter then newline then explanation).",
      },
      { role: "user", content: buildRephrasePrompt(batch) },
    ],
    temperature: 0.4,
    max_tokens: 8192,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return [];
  return parseRephrasedBatch(content);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const batchSizeArg = process.argv.find((a) => a.startsWith("--batch-size="));
  const batchSize = batchSizeArg ? Math.max(1, parseInt(batchSizeArg.split("=")[1], 10) || DEFAULT_BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  const openai = getOpenAI();
  if (!openai) {
    console.error("Set OPENAI_API_KEY or OPENAI_QUESTION_GENERATION_API_KEY to run this script.");
    process.exit(1);
  }

  const allVisible = await db
    .select({ id: questions.id, question: questions.question, answer: questions.answer })
    .from(questions)
    .where(eq(questions.visible, true))
    .orderBy(asc(questions.id));

  const rows = allVisible.filter((r) => {
    const result = validateQuestionFormat(r.question, r.answer);
    return result.valid;
  });
  const skippedCount = allVisible.length - rows.length;
  if (skippedCount > 0) console.log(`Skipping ${skippedCount} visible questions that fail format validation.`);
  console.log(`Rephrasing ${rows.length} visible, validated questions. Batch size: ${batchSize}. Dry run: ${dryRun}`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const rephrased = await rephraseBatch(openai, batch);
    if (rephrased.length !== batch.length) {
      console.warn(`Batch ${i / batchSize + 1}: expected ${batch.length} items, got ${rephrased.length}; skipping batch`);
      failed += batch.length;
      continue;
    }
    for (let j = 0; j < batch.length; j++) {
      const orig = batch[j];
      const next = rephrased[j];
      const result = validateQuestionFormat(next.question, next.answer);
      if (!result.valid) {
        console.warn(`Validation failed for ${orig.id}: ${result.errors.join("; ")}`);
        failed++;
        continue;
      }
      if (dryRun) {
        console.log(`[dry-run] Would update ${orig.id}`);
        updated++;
        continue;
      }
      const ok = await storage.updateQuestionText(orig.id, next.question, next.answer);
      if (ok) updated++;
      else failed++;
    }
    if ((i + batchSize) % 50 < batchSize) {
      console.log(`Progress: ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
    }
    if (i + batchSize < rows.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS_BETWEEN_BATCHES));
    }
  }

  console.log(`Done. Updated: ${updated}, Failed: ${failed}`);
  if (dryRun) console.log("Run without --dry-run to apply changes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
