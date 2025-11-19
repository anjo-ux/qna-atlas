import { useState, useEffect, useCallback } from 'react';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  text: string;
  color: HighlightColor;
  sectionId: string;
  subsectionId: string;
  location: 'reference' | 'question';
  questionId?: string;
  startOffset: number;
  endOffset: number;
}

export interface Note {
  id: string;
  content: string;
  sectionId: string;
  subsectionId: string;
  location: 'reference' | 'question';
  questionId?: string;
  highlightId?: string;
  position: { x: number; y: number };
  timestamp: number;
}

const HIGHLIGHTS_KEY = 'psite-highlights';
const NOTES_KEY = 'psite-notes';

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');

  useEffect(() => {
    const savedHighlights = localStorage.getItem(HIGHLIGHTS_KEY);
    const savedNotes = localStorage.getItem(NOTES_KEY);
    
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    }
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveHighlights = useCallback((newHighlights: Highlight[]) => {
    setHighlights(newHighlights);
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(newHighlights));
  }, []);

  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  }, []);

  const addHighlight = useCallback((highlight: Omit<Highlight, 'id'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    saveHighlights([...highlights, newHighlight]);
    return newHighlight.id;
  }, [highlights, saveHighlights]);

  const removeHighlight = useCallback((id: string) => {
    saveHighlights(highlights.filter(h => h.id !== id));
    // Also remove associated notes
    saveNotes(notes.filter(n => n.highlightId !== id));
  }, [highlights, notes, saveHighlights, saveNotes]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'timestamp'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    saveNotes([...notes, newNote]);
    return newNote.id;
  }, [notes, saveNotes]);

  const updateNote = useCallback((id: string, content: string) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, content } : n));
  }, [notes, saveNotes]);

  const removeNote = useCallback((id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  }, [notes, saveNotes]);

  const getHighlightsForSection = useCallback((
    sectionId: string,
    subsectionId: string,
    location: 'reference' | 'question',
    questionId?: string
  ) => {
    return highlights.filter(h =>
      h.sectionId === sectionId &&
      h.subsectionId === subsectionId &&
      h.location === location &&
      (location === 'question' ? h.questionId === questionId : true)
    );
  }, [highlights]);

  const getNotesForSection = useCallback((
    sectionId: string,
    subsectionId: string,
    location: 'reference' | 'question',
    questionId?: string
  ) => {
    return notes.filter(n =>
      n.sectionId === sectionId &&
      n.subsectionId === subsectionId &&
      n.location === location &&
      (location === 'question' ? n.questionId === questionId : true)
    );
  }, [notes]);

  return {
    highlights,
    notes,
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    getHighlightsForSection,
    getNotesForSection,
  };
}
