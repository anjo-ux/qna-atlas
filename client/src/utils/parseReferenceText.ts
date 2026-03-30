export interface ReferenceContent {
  section: string;
  subsection: string;
  content: string;
}

export interface ReferenceSection {
  id: string;
  title: string;
  subsections: ReferenceSubsection[];
}

export interface ReferenceSubsection {
  id: string;
  title: string;
  content: string;
}

/**
 * Reference sidebar content was removed (prior text was not licensed for redistribution).
 * Returns empty until new reference material is wired in.
 */
export function loadReferenceText(): ReferenceSection[] {
  return [];
}
