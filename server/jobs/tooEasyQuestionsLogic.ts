/** Pure helpers for the weekly “too easy” (≥90% correct) question agent. */

export type HighCorrectRateRow = {
  questionId: string;
  subsectionId: string;
  answered: number;
  uniqueUsers: number;
  incorrect: number;
};

export type TooEasyFinding = {
  questionId: string;
  subsectionId: string;
  answered: number;
  uniqueUsers: number;
  correct: number;
  incorrect: number;
  correctRate: number;
};

export const DEFAULT_MIN_ANSWERS = 10;
export const DEFAULT_MIN_CORRECT_RATE = 0.9;

export function filterTooEasyQuestions(
  rows: HighCorrectRateRow[],
  minAnswers = DEFAULT_MIN_ANSWERS,
  minCorrectRate = DEFAULT_MIN_CORRECT_RATE
): TooEasyFinding[] {
  const min = Math.max(1, Math.floor(minAnswers));
  const threshold = Math.min(1, Math.max(0, minCorrectRate));
  const out: TooEasyFinding[] = [];
  for (const r of rows) {
    if (r.answered < min) continue;
    const incorrect = Math.max(0, r.incorrect);
    const correct = Math.max(0, r.answered - incorrect);
    const correctRate = r.answered > 0 ? correct / r.answered : 0;
    if (correctRate < threshold) continue;
    out.push({
      questionId: r.questionId,
      subsectionId: r.subsectionId,
      answered: r.answered,
      uniqueUsers: r.uniqueUsers,
      correct,
      incorrect,
      correctRate,
    });
  }
  out.sort((a, b) => {
    if (b.correctRate !== a.correctRate) return b.correctRate - a.correctRate;
    if (b.answered !== a.answered) return b.answered - a.answered;
    return b.uniqueUsers - a.uniqueUsers;
  });
  return out;
}

export function truncateForSlack(text: string, max = 400): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function formatCorrectPct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
