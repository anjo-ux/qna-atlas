/**
 * AI question generation job per docs/questions_db_migration_plan.md (requirement 3).
 * Ground truth: DB questions. Input: DB questions + textbook/reference text.
 * Output: New questions inserted with source: 'generated'.
 * Run: npm run generate:questions, or scheduled in-process via QUESTION_GENERATION_INTERVAL_MS.
 */
import OpenAI from "openai";
import { db } from "../db";
import { questions } from "@shared/schema";
import { storage } from "../storage";
import { loadReferenceText } from "../utils/loadReferenceText";
import { subsectionOrder, subsectionTitles } from "@shared/questionImport";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";

const VALID_SUBSECTION_IDS = new Set(subsectionOrder);
const SAMPLE_QUESTIONS_LIMIT = 80;
const QUESTIONS_PER_RUN = 5;
const MAX_QUESTION_CHARS = 4000;
const MAX_ANSWER_CHARS = 2000;

export type GeneratedQuestion = {
  question: string;
  answer: string;
  subsectionId: string;
  tags?: string[];
};

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_QUESTION_GENERATION_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(): string {
  const subsectionList = subsectionOrder
    .slice(0, 50)
    .map((id) => `"${id}" (${subsectionTitles[id] ?? id})`)
    .join(", ");
  return `You are an expert medical education question writer for plastic surgery / board-style multiple-choice questions.

Output format (strict):
- question: Multiple-choice stem followed by exactly 4 options on separate lines, each starting with A), B), C), or D). Example:
  "A 45-year-old patient presents with... Which of the following is most appropriate?
  A) Option one text
  B) Option two text
  C) Option three text
  D) Option four text"
- answer: The correct letter (A, B, C, or D) followed by a newline and a brief explanation. Example:
  "B)
  Option two is correct because..."
- subsectionId: Must be exactly one of these IDs: ${subsectionList}
- tags: Optional array of short topic strings (e.g. ["wound", "healing"]).

Generate only valid JSON. No markdown code fences.`;
}

function buildUserPrompt(sampleQuestionsJson: string, referenceExcerpt: string): string {
  return `Use the following existing questions (ground truth) and textbook/reference excerpt to generate ${QUESTIONS_PER_RUN} new multiple-choice questions that are similar in style and difficulty. Each must have question, answer, subsectionId, and optionally tags.

Existing questions (sample):
${sampleQuestionsJson.slice(0, 12000)}

Textbook/reference excerpt:
${referenceExcerpt.slice(0, 15000)}

Respond with a JSON array of exactly ${QUESTIONS_PER_RUN} objects, each with keys: question, answer, subsectionId, tags (optional). subsectionId must be one of the allowed IDs.`;
}

function parseGeneratedJson(raw: string): GeneratedQuestion[] {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = JSON.parse(text) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: GeneratedQuestion[] = [];
  for (const item of arr) {
    if (item && typeof item === "object" && typeof item.question === "string" && typeof item.answer === "string" && typeof item.subsectionId === "string") {
      const subId = String(item.subsectionId).trim();
      if (!VALID_SUBSECTION_IDS.has(subId)) continue;
      out.push({
        question: String(item.question).slice(0, MAX_QUESTION_CHARS),
        answer: String(item.answer).slice(0, MAX_ANSWER_CHARS),
        subsectionId: subId,
        tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === "string").slice(0, 10) : undefined,
      });
    }
  }
  return out;
}

async function generateWithLLM(
  sampleQuestionsJson: string,
  referenceText: string
): Promise<GeneratedQuestion[]> {
  const openai = getOpenAI();
  if (!openai) {
    console.warn("[questionGenerationJob] No OPENAI_API_KEY or OPENAI_QUESTION_GENERATION_API_KEY; skipping LLM.");
    return [];
  }
  const refExcerpt = referenceText || "(No reference text provided. Generate questions based only on the sample questions.)";
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_QUESTION_GENERATION_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(sampleQuestionsJson, refExcerpt) },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return [];
  try {
    return parseGeneratedJson(content);
  } catch (e) {
    console.error("[questionGenerationJob] Failed to parse LLM response:", e);
    return [];
  }
}

export async function runQuestionGenerationJob(): Promise<{ created: number; total: number; skipped: number }> {
  const existing = await db.select().from(questions).limit(SAMPLE_QUESTIONS_LIMIT);
  const referenceText = await loadReferenceText();
  const sampleJson = JSON.stringify(
    existing.map((q) => ({ question: q.question, answer: q.answer.slice(0, 500), subsectionId: q.subsectionId })),
    null,
    0
  );
  const toInsert = await generateWithLLM(sampleJson, referenceText);
  let created = 0;
  let skipped = 0;
  for (const r of toInsert) {
    if (!r.question.trim() || !r.answer.trim()) {
      skipped++;
      continue;
    }
    await storage.createQuestion({
      question: r.question,
      answer: r.answer,
      subsectionId: r.subsectionId,
      tags: r.tags ?? [],
      source: "generated",
    });
    created++;
  }
  return { created, total: toInsert.length, skipped };
}

// Only run when executed as script (npm run generate:questions), not when imported by server
if (process.argv[1]?.includes("questionGenerationJob")) {
  runQuestionGenerationJob()
    .then((r) => console.log("Done:", r))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
