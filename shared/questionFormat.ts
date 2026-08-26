/**
 * Shared validation for question/answer format used by client (QuestionCard, parseQuestionForReview)
 * and server verification script. Ensures every question has: question text, A/B/C/D choices,
 * show answer (correct letter), and answer explanation.
 */
export interface QuestionFormatResult {
  valid: boolean;
  errors: string[];
  choiceCount: number;
  correctAnswer: string | null;
}

const CHOICE_LINE_REGEX = /^([A-Fa-f1-6])\s*[.)]\s*(.+)$|^\s*\(([A-Fa-f1-6])\)\s*(.+)$/;

function toChoiceLetter(captured: string): string {
  const upper = captured.toUpperCase();
  if (/[A-F]/.test(upper)) return upper;
  const n = parseInt(captured, 10);
  if (n >= 1 && n <= 6) return String.fromCharCode(64 + n);
  return upper;
}

function indexOfFirstChoiceLine(lines: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(CHOICE_LINE_REGEX);
    if (m && (m[2]?.trim() || m[4]?.trim())) {
      const letter = toChoiceLetter(m[1] || m[3] || "");
      const text = (m[2] || m[4] || "").trim();
      if (letter && text && /^[A-F]$/.test(letter)) return i;
    }
  }
  return -1;
}

/**
 * Narrative part of the question before answer choices (not including option lines).
 * Used for content filtering (e.g. keywords that should not appear in the stem).
 */
export function extractQuestionStem(questionText: string): string {
  const q = (questionText || "").trim();
  if (!q) return "";
  const lines = q.split("\n");
  const choiceIdx = indexOfFirstChoiceLine(lines);
  if (choiceIdx >= 0) {
    return lines.slice(0, choiceIdx).join("\n").trim();
  }
  const questionMarkers = ["?", ":", "."];
  let lastMarkerIndex = -1;
  for (const marker of questionMarkers) {
    const index = q.lastIndexOf(marker);
    if (index > lastMarkerIndex) lastMarkerIndex = index;
  }
  if (lastMarkerIndex === -1) {
    const m = q.match(/^([\s\S]*?)(?=\s+[A-Fa-f1-6]\s*[.)]\s*\S)/);
    return (m ? m[1] : q).trim();
  }
  const afterMarker = q.substring(lastMarkerIndex + 1);
  const choiceMatches = Array.from(afterMarker.matchAll(/([A-Fa-f1-6])\s*[.)]\s*/g));
  if (choiceMatches.length >= 2) {
    const firstIdx = choiceMatches[0].index!;
    return q.substring(0, lastMarkerIndex + 1 + firstIdx).trim();
  }
  return q.substring(0, lastMarkerIndex + 1).trim();
}

const SEE_IMAGE_IN_CHOICE_RE = /see\s+image/i;

/**
 * Parsed MCQ options with letters (same parsing as extractChoices).
 * Empty if choices could not be parsed.
 */
export function extractMcqChoices(questionText: string): { letter: string; text: string }[] {
  const lines = questionText.split("\n");
  let choicesOnSeparateLines = false;
  for (const line of lines) {
    const m = line.match(CHOICE_LINE_REGEX);
    if (m && (m[2]?.trim() || m[4]?.trim())) {
      choicesOnSeparateLines = true;
      break;
    }
  }
  const choices: { letter: string; text: string }[] = [];
  if (choicesOnSeparateLines) {
    for (const line of lines) {
      const m = line.match(CHOICE_LINE_REGEX);
      if (m) {
        const letter = toChoiceLetter(m[1] || m[3] || "");
        const text = (m[2] || m[4] || "").trim();
        if (letter && text && /^[A-F]$/.test(letter)) choices.push({ letter, text });
      }
    }
    return choices;
  }
  const questionMarkers = ["?", ":", "."];
  let lastMarkerIndex = -1;
  for (const marker of questionMarkers) {
    const index = questionText.lastIndexOf(marker);
    if (index > lastMarkerIndex) lastMarkerIndex = index;
  }
  if (lastMarkerIndex === -1) return [];
  const afterMarker = questionText.substring(lastMarkerIndex + 1);
  const choiceMatches = Array.from(afterMarker.matchAll(/([A-Fa-f1-6])\s*[.)]\s*/g));
  if (choiceMatches.length < 2 || choiceMatches.length > 6) return [];
  for (let i = 0; i < choiceMatches.length; i++) {
    const letter = toChoiceLetter(choiceMatches[i][1]);
    if (!/^[A-F]$/.test(letter)) continue;
    const startIndex = choiceMatches[i].index! + choiceMatches[i][0].length;
    const endIndex = i < choiceMatches.length - 1 ? choiceMatches[i + 1].index! : afterMarker.length;
    const text = afterMarker.substring(startIndex, endIndex).trim();
    if (text) choices.push({ letter, text });
  }
  return choices;
}

function choiceTextsFromQuestion(questionText: string): string[] {
  return extractMcqChoices(questionText).map((c) => c.text);
}

/**
 * True when any parsed MCQ option text references an image (e.g. "(see image above)").
 * Used to hide image-dependent items from the bank.
 */
export function questionMcqChoicesReferenceSeeImage(questionText: string): boolean {
  for (const t of choiceTextsFromQuestion(questionText)) {
    if (SEE_IMAGE_IN_CHOICE_RE.test(t)) return true;
  }
  return false;
}

function extractChoices(questionText: string): { count: number } {
  return { count: choiceTextsFromQuestion(questionText).length };
}

/**
 * Collapse a leading "X)" line into the following explanation so markdown renders
 * as one paragraph (avoids a large gap when the source uses blank lines after the letter).
 * Wraps "X) Correct Answer …:" (and "Option X is correct:") in markdown **bold** for display.
 */
export function normalizeAnswerExplanationForDisplay(answer: string): string {
  let a = answer ?? "";
  a = a.replace(/^\s*([A-F])\)\s*(?:\r?\n\s*)+/i, (_, letter: string) => `${letter.toUpperCase()}) `);
  a = a.replace(
    /^\s*(Option\s+[A-F]\s+is\s+correct:)\s*(?:\r?\n\s*)+/i,
    (_, prefix: string) => `**${prefix.trim()}** `
  );
  // "A) Correct Answer (A):" or "A) Correct Answer:" → bold entire prefix through the colon
  a = a.replace(
    /^(\s*)([A-F])\)(\s+)(Correct Answer(?:\s*\([A-F]\))?\s*:)(\s*)/i,
    (_, sp, letter, sp2, label, trail) => {
      const L = String(letter).toUpperCase();
      return `${sp}**${L})${sp2}${label.trimEnd()}**${trail || " "}`;
    }
  );
  return a;
}

export function extractCorrectAnswer(answer: string): string | null {
  const phraseMatch = answer.match(
    /(?:correct answer is|answer is|correct response is|response is)\s*(?:option\s+)?([A-F])/i
  );
  if (phraseMatch) return phraseMatch[1].toUpperCase();
  const leadingMatch = answer.match(/^\s*([A-F])\)/);
  return leadingMatch ? leadingMatch[1].toUpperCase() : null;
}

/**
 * Validate that question and answer have the required format:
 * - Non-empty question and answer
 * - At least 2 answer choices (A, B, C, D, etc.)
 * - A detectable correct answer (phrase or leading "X)")
 * - Answer includes explanation content (not just the letter)
 */
export function validateQuestionFormat(question: string, answer: string): QuestionFormatResult {
  const errors: string[] = [];
  let choiceCount = 0;
  let correctAnswer: string | null = null;

  const q = (question || "").trim();
  const a = (answer || "").trim();

  if (!q) errors.push("Question text is empty");
  if (!a) errors.push("Answer text is empty");

  if (q) {
    const { count } = extractChoices(q);
    choiceCount = count;
    if (count < 2) errors.push(`Expected at least 2 choices (A, B, C, D); found ${count}`);
  }

  if (a) {
    correctAnswer = extractCorrectAnswer(a);
    if (!correctAnswer) errors.push("Could not detect correct answer (expected 'answer is X' or 'X)\\n...' at start)");
    // Explanation: if answer starts with "A)" only, require more content after (explanation)
    const leadingLetterOnly = /^\s*[A-F]\)\s*$/i.test(a);
    if (leadingLetterOnly) errors.push("Answer has no explanation (expected letter plus explanation text)");
  }

  return {
    valid: errors.length === 0,
    errors,
    choiceCount,
    correctAnswer,
  };
}

/** Keywords that disqualify generated questions (image-based; cannot be shown without media). */
const GENERATED_DISALLOWED_KEYWORDS = ["picture", "pictured", "photo"];

/**
 * Additional content rules for source === 'generated' questions.
 * Fails if the stem contains "radiographic", or the full text contains image-related keywords (picture, pictured, photo).
 * Pass hasImage: true when an image is attached — keywords are allowed.
 */
export function contentRulesForGenerated(
  questionText: string,
  options?: { hasImage?: boolean },
): { pass: boolean; reason?: string } {
  if (options?.hasImage) {
    return { pass: true };
  }
  const stem = extractQuestionStem(questionText).toLowerCase();
  if (stem.includes("radiographic")) {
    return { pass: false, reason: 'Generated question stem must not contain "radiographic".' };
  }
  const q = (questionText || "").toLowerCase();
  for (const keyword of GENERATED_DISALLOWED_KEYWORDS) {
    if (q.includes(keyword)) {
      return { pass: false, reason: `Generated question contains disallowed keyword: "${keyword}"` };
    }
  }
  return { pass: true };
}
