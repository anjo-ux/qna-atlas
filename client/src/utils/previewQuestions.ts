import { Section, Question } from '@/types/question';

// Seeded random function for consistent results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getPreviewQuestions(sections: Section[]): Question[] {
  // Flatten all questions
  const allQuestions: Question[] = [];
  sections.forEach(section => {
    section.subsections.forEach(subsection => {
      allQuestions.push(...subsection.questions);
    });
  });

  if (allQuestions.length === 0) return [];

  // Use seeded random to pick 20 questions consistently
  const selectedIndices = new Set<number>();
  let seed = 12345; // Fixed seed for consistent results

  while (selectedIndices.size < Math.min(20, allQuestions.length)) {
    seed++;
    const randomIndex = Math.floor(seededRandom(seed) * allQuestions.length);
    selectedIndices.add(randomIndex);
  }

  return Array.from(selectedIndices).map(i => allQuestions[i]);
}
