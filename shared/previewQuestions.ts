/** Fixed seed so the same 20 questions are chosen every time, everywhere. */
export const PREVIEW_SEED = 12345;
export const PREVIEW_COUNT = 20;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Deterministic preview selection: sort by id, then pick PREVIEW_COUNT indices
 * with a fixed seed. Same set for every user, every time.
 */
export function selectPreviewQuestions<T extends { id: string }>(
  questions: T[],
  count: number = PREVIEW_COUNT,
  seedStart: number = PREVIEW_SEED,
): T[] {
  const sorted = [...questions].sort((a, b) => a.id.localeCompare(b.id));
  if (sorted.length === 0) return [];

  const selectedIndices = new Set<number>();
  let seed = seedStart;
  while (selectedIndices.size < Math.min(count, sorted.length)) {
    seed++;
    const idx = Math.floor(seededRandom(seed) * sorted.length);
    selectedIndices.add(idx);
  }
  return Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map((i) => sorted[i]);
}
