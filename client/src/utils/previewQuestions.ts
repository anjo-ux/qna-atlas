import { selectPreviewQuestions } from "@shared/previewQuestions";
import { Section, Question } from "@/types/question";

/**
 * Returns exactly 20 questions for the preview test. Selection is deterministic
 * (shared with the server `/api/preview/questions` endpoint).
 */
export function getPreviewQuestions(sections: Section[]): Question[] {
  const all: Question[] = [];
  sections.forEach((section) => {
    section.subsections.forEach((subsection) => {
      all.push(...subsection.questions);
    });
  });
  return selectPreviewQuestions(all);
}

/** Minimal section tree so TestMode can resolve section/subsection for answers. */
export function buildSectionsFromQuestions(questions: Question[]): Section[] {
  const sectionMap = new Map<string, Map<string, Question[]>>();
  for (const q of questions) {
    const secId = q.category || "preview";
    const subId = q.subcategory || "preview";
    if (!sectionMap.has(secId)) sectionMap.set(secId, new Map());
    const subMap = sectionMap.get(secId)!;
    if (!subMap.has(subId)) subMap.set(subId, []);
    subMap.get(subId)!.push(q);
  }
  return Array.from(sectionMap.entries()).map(([id, subs]) => ({
    id,
    title: id,
    subsections: Array.from(subs.entries()).map(([subId, qs]) => ({
      id: subId,
      title: subId,
      questions: qs,
    })),
  }));
}
