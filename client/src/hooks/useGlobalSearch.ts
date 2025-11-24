import { useMemo } from 'react';
import { Section } from '@/types/question';
import { ReferenceSection } from '@/utils/parseReferenceText';
import { Note } from '@/hooks/useHighlights';

export interface SearchResult {
  type: 'question' | 'reference' | 'note';
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  questionId?: string;
  noteId?: string;
  content: string;
  matchedText: string;
}

export function useGlobalSearch(
  sections: Section[],
  referenceSections: ReferenceSection[],
  notes: Note[],
  query: string
) {
  const results = useMemo((): SearchResult[] => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = query.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search in questions
    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        subsection.questions.forEach(question => {
          const questionText = question.question.toLowerCase();
          const answerText = question.answer.toLowerCase();
          
          if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
            // Find the matched text snippet
            const matchIndex = questionText.includes(searchTerm) 
              ? questionText.indexOf(searchTerm)
              : answerText.indexOf(searchTerm);
            
            const sourceText = questionText.includes(searchTerm) ? question.question : question.answer;
            const start = Math.max(0, matchIndex - 50);
            const end = Math.min(sourceText.length, matchIndex + searchTerm.length + 50);
            const matchedText = (start > 0 ? '...' : '') + 
              sourceText.substring(start, end) + 
              (end < sourceText.length ? '...' : '');

            foundResults.push({
              type: 'question',
              sectionId: section.id,
              sectionTitle: section.title,
              subsectionId: subsection.id,
              subsectionTitle: subsection.title,
              questionId: question.id,
              content: question.question,
              matchedText,
            });
          }
        });
      });
    });

    // Search in reference text
    referenceSections.forEach(section => {
      section.subsections.forEach(subsection => {
        const contentLower = subsection.content.toLowerCase();
        if (contentLower.includes(searchTerm)) {
          const matchIndex = contentLower.indexOf(searchTerm);
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(subsection.content.length, matchIndex + searchTerm.length + 50);
          const matchedText = (start > 0 ? '...' : '') + 
            subsection.content.substring(start, end) + 
            (end < subsection.content.length ? '...' : '');

          foundResults.push({
            type: 'reference',
            sectionId: section.id,
            sectionTitle: section.title,
            subsectionId: subsection.id,
            subsectionTitle: subsection.title,
            content: subsection.content,
            matchedText,
          });
        }
      });
    });

    // Search in notes
    notes.forEach(note => {
      const noteLower = note.content.toLowerCase();
      if (noteLower.includes(searchTerm)) {
        // Find the section and subsection titles
        const section = sections.find(s => s.id === note.sectionId);
        const subsection = section?.subsections.find(ss => ss.id === note.subsectionId);

        if (section && subsection) {
          const matchIndex = noteLower.indexOf(searchTerm);
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(note.content.length, matchIndex + searchTerm.length + 50);
          const matchedText = (start > 0 ? '...' : '') + 
            note.content.substring(start, end) + 
            (end < note.content.length ? '...' : '');

          foundResults.push({
            type: 'note',
            sectionId: note.sectionId,
            sectionTitle: section.title,
            subsectionId: note.subsectionId,
            subsectionTitle: subsection.title,
            noteId: note.id,
            content: note.content,
            matchedText,
          });
        }
      }
    });

    return foundResults;
  }, [sections, referenceSections, notes, query]);

  return results;
}
