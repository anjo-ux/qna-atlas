/**
 * LLM medical-correctness review of all Ortho questions.
 * - Auto-applies high-confidence fixes
 * - Flags uncertain / medium-confidence issues for human review
 *
 *   npm run validate:ortho-questions
 *   ORTHO_VALIDATE_LIMIT=50  # optional sample
 *   ORTHO_VALIDATE_CONCURRENCY=3
 *   ORTHO_VALIDATE_BATCH=4
 */
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { sql, like, eq } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { questions } from "@shared/schema";
import { validateQuestionFormat } from "@shared/questionFormat";

const OUT_DIR = path.join(process.cwd(), "server", "data");
const FLAG_PATH = path.join(OUT_DIR, "orthoValidationFlags.json");
const SUMMARY_PATH = path.join(OUT_DIR, "orthoValidationSummary.json");

const LIMIT = process.env.ORTHO_VALIDATE_LIMIT
  ? parseInt(process.env.ORTHO_VALIDATE_LIMIT, 10)
  : Infinity;
const BATCH = Math.min(6, Math.max(1, parseInt(process.env.ORTHO_VALIDATE_BATCH || "4", 10) || 4));
const CONCURRENCY = Math.min(
  4,
  Math.max(1, parseInt(process.env.ORTHO_VALIDATE_CONCURRENCY || "3", 10) || 3)
);
const MODEL = process.env.OPENAI_QUESTION_GENERATION_MODEL || "gpt-4o-mini";
const ONLY_GENERATED = process.env.ORTHO_VALIDATE_ONLY_GENERATED === "1";

type Verdict = "ok" | "fix" | "flag";
type Confidence = "high" | "medium" | "low";

type ReviewItem = {
  id: string;
  verdict: Verdict;
  confidence: Confidence;
  issue?: string;
  correctedQuestion?: string;
  correctedAnswer?: string;
};

type FlagRecord = {
  id: string;
  subsectionId: string;
  confidence: Confidence;
  issue: string;
  questionPreview: string;
  answerPreview: string;
  suggestedQuestion?: string;
  suggestedAnswer?: string;
  reviewedAt: string;
};

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_QUESTION_GENERATION_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(): string {
  return `You are an orthopaedic surgery board-exam content auditor for Ortho Atlas.
Review each MCQ for MEDICAL CORRECTNESS of the marked answer and explanation.

For each item return JSON with:
- id: string (echo input id)
- verdict: "ok" | "fix" | "flag"
- confidence: "high" | "medium" | "low"
- issue: short description when not ok
- correctedQuestion: full question text ONLY if the stem/choices must change (rare)
- correctedAnswer: full answer text starting with correct letter like "B)\\nExplanation..." when verdict is "fix"

Rules:
- verdict "ok": marked letter + explanation are medically correct for OITE/board level.
- verdict "fix": clear error (wrong letter, or explanation contradicts the correct choice). Provide correctedAnswer. Use confidence "high" only when you are sure.
- verdict "flag": ambiguous, outdated, or you are unsure — do NOT invent a fix. Explain the concern in issue.
- Prefer "flag" over a low-confidence "fix".
- Do not rewrite style unless needed for correctness.
- Avoid the word "radiographic" in any corrected stem.

Output: JSON array only, no markdown fences.`;
}

function parseReviews(raw: string): ReviewItem[] {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = JSON.parse(text) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: ReviewItem[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const id = String((item as any).id ?? "").trim();
    const verdict = String((item as any).verdict ?? "").toLowerCase() as Verdict;
    const confidence = String((item as any).confidence ?? "low").toLowerCase() as Confidence;
    if (!id || !["ok", "fix", "flag"].includes(verdict)) continue;
    out.push({
      id,
      verdict,
      confidence: ["high", "medium", "low"].includes(confidence) ? confidence : "low",
      issue: typeof (item as any).issue === "string" ? (item as any).issue : undefined,
      correctedQuestion:
        typeof (item as any).correctedQuestion === "string"
          ? (item as any).correctedQuestion
          : undefined,
      correctedAnswer:
        typeof (item as any).correctedAnswer === "string" ? (item as any).correctedAnswer : undefined,
    });
  }
  return out;
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function reviewBatch(
  openai: OpenAI,
  batch: { id: string; question: string; answer: string }[]
): Promise<ReviewItem[]> {
  const payload = batch.map((b) => ({
    id: b.id,
    question: b.question.slice(0, 3500),
    answer: b.answer.slice(0, 1800),
  }));
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: `Review these ${payload.length} Ortho Atlas MCQs:\n${JSON.stringify(payload)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return batch.map((b) => ({ id: b.id, verdict: "flag" as const, confidence: "low" as const, issue: "Empty model response" }));
  try {
    return parseReviews(content);
  } catch (e) {
    console.error("parse fail", e);
    return batch.map((b) => ({
      id: b.id,
      verdict: "flag" as const,
      confidence: "low" as const,
      issue: "Failed to parse auditor JSON",
    }));
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const openai = getOpenAI();

  let rows = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      subsectionId: questions.subsectionId,
      source: questions.source,
      tags: questions.tags,
    })
    .from(questions)
    .where(like(questions.id, "ortho-%"));

  if (ONLY_GENERATED) {
    rows = rows.filter((r) => r.source === "generated");
  }
  if (Number.isFinite(LIMIT)) rows = rows.slice(0, LIMIT);

  console.log(
    JSON.stringify({ total: rows.length, batch: BATCH, concurrency: CONCURRENCY, model: MODEL, onlyGenerated: ONLY_GENERATED })
  );

  const batches: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += BATCH) batches.push(rows.slice(i, i + BATCH));

  let ok = 0;
  let fixed = 0;
  let flagged = 0;
  let fixSkipped = 0;
  const flags: FlagRecord[] = [];
  const byId = new Map(rows.map((r) => [r.id, r]));

  let doneBatches = 0;
  await mapPool(batches, CONCURRENCY, async (batch) => {
    const reviews = await reviewBatch(
      openai,
      batch.map((b) => ({ id: b.id, question: b.question, answer: b.answer }))
    );
    const seen = new Set<string>();
    for (const rev of reviews) {
      seen.add(rev.id);
      const row = byId.get(rev.id);
      if (!row) continue;

      if (rev.verdict === "ok") {
        ok++;
        continue;
      }

      if (rev.verdict === "fix" && rev.confidence === "high" && rev.correctedAnswer) {
        const newQ = rev.correctedQuestion?.trim() || row.question;
        const newA = rev.correctedAnswer.trim();
        const fmt = validateQuestionFormat(newQ, newA);
        if (!fmt.valid) {
          fixSkipped++;
          flags.push({
            id: row.id,
            subsectionId: row.subsectionId,
            confidence: rev.confidence,
            issue: `Proposed fix failed format: ${fmt.errors.join("; ")}. Original issue: ${rev.issue ?? ""}`,
            questionPreview: row.question.slice(0, 240),
            answerPreview: row.answer.slice(0, 200),
            suggestedQuestion: rev.correctedQuestion,
            suggestedAnswer: rev.correctedAnswer,
            reviewedAt: new Date().toISOString(),
          });
          flagged++;
          continue;
        }
        await db
          .update(questions)
          .set({
            question: newQ,
            answer: newA,
            tags: Array.from(
              new Set([...(Array.isArray(row.tags) ? row.tags : []), "validation-auto-fixed"])
            ),
            updatedAt: new Date(),
          })
          .where(eq(questions.id, row.id));
        fixed++;
        continue;
      }

      // flag or non-high-confidence fix — hide until unflagged (any specialty)
      flagged++;
      await storage.flagQuestion(row.id, "validation-flagged");
      flags.push({
        id: row.id,
        subsectionId: row.subsectionId,
        confidence: rev.confidence,
        issue: rev.issue || (rev.verdict === "fix" ? "Fix proposed without high confidence" : "Flagged for review"),
        questionPreview: row.question.slice(0, 240),
        answerPreview: row.answer.slice(0, 200),
        suggestedQuestion: rev.correctedQuestion,
        suggestedAnswer: rev.correctedAnswer,
        reviewedAt: new Date().toISOString(),
      });
    }
    for (const b of batch) {
      if (!seen.has(b.id)) {
        flagged++;
        await storage.flagQuestion(b.id, "validation-flagged");
        flags.push({
          id: b.id,
          subsectionId: b.subsectionId,
          confidence: "low",
          issue: "Missing from auditor response",
          questionPreview: b.question.slice(0, 240),
          answerPreview: b.answer.slice(0, 200),
          reviewedAt: new Date().toISOString(),
        });
      }
    }
    doneBatches++;
    if (doneBatches % 10 === 0 || doneBatches === batches.length) {
      console.log(`progress ${doneBatches}/${batches.length} ok=${ok} fixed=${fixed} flagged=${flagged}`);
      fs.writeFileSync(FLAG_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), flags }, null, 2));
    }
  });

  const summary = {
    reviewedAt: new Date().toISOString(),
    totalReviewed: rows.length,
    ok,
    autoFixed: fixed,
    flagged,
    fixSkippedFormat: fixSkipped,
    flagPath: FLAG_PATH,
  };
  fs.writeFileSync(FLAG_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), flags }, null, 2));
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  console.log("Done:", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
