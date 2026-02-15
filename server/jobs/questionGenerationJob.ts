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

function buildSystemPrompt(opts: { count?: number; section?: string } = {}): string {
  const count = opts.count ?? QUESTIONS_PER_RUN;
  const section = opts.section ?? "plastic surgery (use one of the allowed subsection IDs per question)";
  const subsectionList = subsectionOrder
    .slice(0, 50)
    .map((id) => `"${id}" (${subsectionTitles[id] ?? id})`)
    .join(", ");
  return `You are an expert plastic surgery board exam question generator.
Generate ${count} NEW, UNIQUE multiple-choice questions (A-E) for the section: "${section}".
Difficulty mix (required): AT LEAST 2 questions in every batch MUST be third-order (as defined below). The remaining questions may be second-order. No first-order (recall-only) questions.

Definition of third-order (use for at least 2 questions per batch):
A third-order multiple-choice question is a high-level, complex query requiring multiple cognitive steps. It often involves: (1) synthesizing information from the vignette, (2) diagnosing or recognizing the clinical scenario, and (3) identifying an underlying mechanism, next-best step, or best management. Unlike direct recall, these questions require the examinee to analyze the case, recognize the condition, and then identify the best management or mechanism.

Second-order (allowed for the rest): Application/analysis—apply knowledge to a scenario, interpret findings, or choose next step. Still board-level with narrative stems; avoid simple recall.

Narrative stems (required):
- Every question stem MUST be a rich clinical scenario, like real board exams. Include: patient age/sex when relevant, presenting complaint, relevant history (duration, prior treatment, comorbidities), key physical exam or imaging findings, and sometimes labs or pathology—then ask the question. Use 2–5 sentences of narrative before "Which of the following...?"
- Match the narrative style and depth of the example question database: detailed, specific (e.g. "A 52-year-old woman presents with a 6-month history of... On examination she has... MRI shows... Which of the following is the most appropriate next step?").
- Avoid one-line stems. Stems should feel like brief clinical vignettes that require analyzing the case, recognizing the condition, and identifying best management or mechanism.

Critical rules:
- Do NOT duplicate or closely paraphrase any question or explanation from the ground truth. Every question and every explanation must be newly written and substantively different.
- Include AT LEAST 2 third-order questions per batch (as defined above). The remaining questions may be second-order (application/analysis). No first-order recall-only questions.
- Write original explanations; do not copy or rephrase explanations from the sample questions.
- Before responding, ensure no generated question or explanation is a duplicate or close paraphrase of any of the existing questions or their answers.
- Use subtle, board-style distractors: incorrect options should be plausible (e.g. other valid treatments in different contexts, common misconceptions) rather than obviously wrong.

Output format (strict):
- question: Full narrative stem (2–5 sentences of clinical scenario) ending with a clear question, then exactly 4 or 5 options on separate lines, each starting with A), B), C), D), and optionally E). Example structure:
  "A 52-year-old woman presents with a 6-month history of unilateral breast thickening and nipple retraction. She has no family history of breast cancer. Mammography shows a spiculated mass; core biopsy confirms invasive ductal carcinoma, ER/PR positive, HER2 negative. Which of the following is the most appropriate next step in management?
  A) Option one text
  B) Option two text
  C) Option three text
  D) Option four text
  E) Option five text"
- answer: The correct letter (A, B, C, D, or E) followed by a newline and a brief explanation. Example:
  "B)
  Option two is correct because..."
- subsectionId: Must be exactly one of these IDs: ${subsectionList}
- tags: Optional array of short topic strings (e.g. ["wound", "healing"]).

Generate only valid JSON. No markdown code fences.`;
}

function buildUserPrompt(sampleQuestionsJson: string, referenceExcerpt: string): string {
  return `Use the following existing questions ONLY as style and difficulty reference—do not duplicate or closely paraphrase them. Notice how the example questions use rich narrative stems (patient scenario, history, exam/imaging, then the question). Mirror that narrative style: each of your questions must have a multi-sentence clinical vignette before the options. Use the textbook/reference excerpt for accurate content. Generate ${QUESTIONS_PER_RUN} NEW, UNIQUE multiple-choice questions. Include AT LEAST 2 third-order questions (synthesis, diagnose from vignette, identify mechanism or best management); the rest may be second-order (application/analysis). No first-order recall-only questions. Each question and its explanation must be original; do not repeat or closely rephrase any question or explanation from the sample set. Make questions challenging with plausible distractors.

Existing questions (mirror their narrative stem length and clinical detail—do not copy):
${sampleQuestionsJson.slice(0, 12000)}

Textbook/reference excerpt (use for content):
${referenceExcerpt.slice(0, 15000)}

Respond with a JSON array of exactly ${QUESTIONS_PER_RUN} objects, each with keys: question, answer, subsectionId, tags (optional). subsectionId must be one of the allowed IDs. Every question stem must be a multi-sentence clinical scenario (2–5 sentences) before the answer choices.`;
}

/** Normalize text for similarity: lowercase, collapse whitespace, keep only word chars. */
function normalizeForSimilarity(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Return true if generated question is too similar to any existing question (avoid duplicates). */
function isTooSimilarToExisting(
  generatedQuestion: string,
  existingQuestions: string[]
): boolean {
  const genNorm = normalizeForSimilarity(generatedQuestion);
  const genWords = new Set(genNorm.split(/\s+/).filter((w) => w.length > 2));
  if (genWords.size < 5) return false;
  for (const existing of existingQuestions) {
    const existNorm = normalizeForSimilarity(existing);
    const existWords = new Set(existNorm.split(/\s+/).filter((w) => w.length > 2));
    let overlap = 0;
    for (const w of genWords) if (existWords.has(w)) overlap++;
    const ratio = overlap / genWords.size;
    if (ratio > 0.5) return true;
  }
  return false;
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
        tags: Array.isArray(item.tags) ? item.tags.filter((t: any): t is string => typeof t === "string").slice(0, 10) : undefined,
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
    temperature: 0.6,
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
  const existingQuestionTexts = existing.map((q) => q.question);
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
    if (isTooSimilarToExisting(r.question, existingQuestionTexts)) {
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
    existingQuestionTexts.push(r.question);
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
