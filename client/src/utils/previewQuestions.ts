import { Section, Question } from '@/types/question';

// Fixed seed so the same 20 questions are chosen every time, everywhere.
const PREVIEW_SEED = 12345;
const PREVIEW_COUNT = 20;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Returns exactly 20 questions for the preview test. Selection is deterministic:
 * all questions are sorted by id, then 20 indices are chosen with a fixed seed.
 * Same 20 questions for every user, every time.
 */
export function getPreviewQuestions(sections: Section[]): Question[] {
  const all: Question[] = [];
  sections.forEach(section => {
    section.subsections.forEach(subsection => {
      all.push(...subsection.questions);
    });
  });
  const sorted = [...all].sort((a, b) => a.id.localeCompare(b.id));
  if (sorted.length === 0) return [];

  const selectedIndices = new Set<number>();
  let seed = PREVIEW_SEED;
  while (selectedIndices.size < Math.min(PREVIEW_COUNT, sorted.length)) {
    seed++;
    const idx = Math.floor(seededRandom(seed) * sorted.length);
    selectedIndices.add(idx);
  }
  return Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map(i => sorted[i]);
}
