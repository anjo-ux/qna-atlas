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

function extractChoices(questionText: string): { count: number } {
  const lines = questionText.split("\n");
  let choicesOnSeparateLines = false;
  for (const line of lines) {
    const m = line.match(CHOICE_LINE_REGEX);
    if (m && (m[2]?.trim() || m[4]?.trim())) {
      choicesOnSeparateLines = true;
      break;
    }
  }
  if (choicesOnSeparateLines) {
    let count = 0;
    for (const line of lines) {
      const m = line.match(CHOICE_LINE_REGEX);
      if (m) {
        const letter = toChoiceLetter(m[1] || m[3] || "");
        const text = (m[2] || m[4] || "").trim();
        if (letter && text && /^[A-F]$/.test(letter)) count++;
      }
    }
    return { count };
  }
  const questionMarkers = ["?", ":", "."];
  let lastMarkerIndex = -1;
  for (const marker of questionMarkers) {
    const index = questionText.lastIndexOf(marker);
    if (index > lastMarkerIndex) lastMarkerIndex = index;
  }
  if (lastMarkerIndex === -1) return { count: 0 };
  const afterMarker = questionText.substring(lastMarkerIndex + 1);
  const choiceMatches = Array.from(afterMarker.matchAll(/([A-Fa-f1-6])\s*[.)]\s*/g));
  if (choiceMatches.length >= 2 && choiceMatches.length <= 6) {
    let count = 0;
    for (let i = 0; i < choiceMatches.length; i++) {
      const letter = toChoiceLetter(choiceMatches[i][1]);
      if (!/^[A-F]$/.test(letter)) continue;
      const startIndex = choiceMatches[i].index! + choiceMatches[i][0].length;
      const endIndex = i < choiceMatches.length - 1 ? choiceMatches[i + 1].index! : afterMarker.length;
      const text = afterMarker.substring(startIndex, endIndex).trim();
      if (text) count++;
    }
    return { count };
  }
  return { count: 0 };
}

function extractCorrectAnswer(answer: string): string | null {
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
 * Fails if question contains image-related keywords (picture, pictured, photo).
 */
export function contentRulesForGenerated(questionText: string): { pass: boolean; reason?: string } {
  const q = (questionText || "").toLowerCase();
  for (const keyword of GENERATED_DISALLOWED_KEYWORDS) {
    if (q.includes(keyword)) {
      return { pass: false, reason: `Generated question contains disallowed keyword: "${keyword}"` };
    }
  }
  return { pass: true };
}
