import type { Section } from '@/types/question';

/** Same titles as the main section picker (`Navigation` uses `section.title`). */
export function getSectionTitle(sections: Section[], sectionId: string): string {
  return sections.find((s) => s.id === sectionId)?.title ?? sectionId;
}
