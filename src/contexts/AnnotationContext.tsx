import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Highlight {
  id: string;
  sectionId: string;
  subsectionId: string;
  text: string;
  color: string;
  startOffset: number;
  endOffset: number;
  containerType: 'reference' | 'question';
  questionId?: string;
}

export interface StickyNote {
  id: string;
  sectionId: string;
  subsectionId: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  containerType: 'reference';
}

interface AnnotationContextType {
  highlights: Highlight[];
  notes: StickyNote[];
  addHighlight: (highlight: Omit<Highlight, 'id'>) => void;
  removeHighlight: (id: string) => void;
  addNote: (note: Omit<StickyNote, 'id'>) => void;
  updateNote: (id: string, text: string) => void;
  removeNote: (id: string) => void;
  getHighlightsForContent: (sectionId: string, subsectionId: string, containerType: 'reference' | 'question', questionId?: string) => Highlight[];
  getNotesForContent: (sectionId: string, subsectionId: string) => StickyNote[];
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHighlights = localStorage.getItem('psite-highlights');
    const savedNotes = localStorage.getItem('psite-notes');
    
    if (savedHighlights) {
      try {
        setHighlights(JSON.parse(savedHighlights));
      } catch (e) {
        console.error('Failed to parse highlights:', e);
      }
    }
    
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes:', e);
      }
    }
  }, []);

  // Save to localStorage whenever highlights or notes change
  useEffect(() => {
    localStorage.setItem('psite-highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('psite-notes', JSON.stringify(notes));
  }, [notes]);

  const addHighlight = (highlight: Omit<Highlight, 'id'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `highlight-${Date.now()}-${Math.random()}`,
    };
    setHighlights(prev => [...prev, newHighlight]);
  };

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const addNote = (note: Omit<StickyNote, 'id'>) => {
    const newNote: StickyNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random()}`,
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, text: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, text } : note
    ));
  };

  const removeNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getHighlightsForContent = (
    sectionId: string, 
    subsectionId: string, 
    containerType: 'reference' | 'question',
    questionId?: string
  ) => {
    return highlights.filter(h => 
      h.sectionId === sectionId && 
      h.subsectionId === subsectionId &&
      h.containerType === containerType &&
      (containerType === 'reference' || h.questionId === questionId)
    );
  };

  const getNotesForContent = (sectionId: string, subsectionId: string) => {
    return notes.filter(n => 
      n.sectionId === sectionId && n.subsectionId === subsectionId
    );
  };

  return (
    <AnnotationContext.Provider
      value={{
        highlights,
        notes,
        addHighlight,
        removeHighlight,
        addNote,
        updateNote,
        removeNote,
        getHighlightsForContent,
        getNotesForContent,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotations() {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
}
