import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

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
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Load notes from API on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch('/api/notes', { credentials: 'include' });
        if (response.ok) {
          const dbNotes = await response.json();
          const formattedNotes = dbNotes.map((n: any) => ({
            id: n.id,
            content: n.content,
            sectionId: n.sectionId,
            subsectionId: n.subsectionId,
            location: n.location,
            questionId: n.questionId,
            position: { x: n.positionX, y: n.positionY },
            timestamp: new Date(n.createdAt).getTime(),
          }));
          setNotes(formattedNotes);
          localStorage.setItem(NOTES_KEY, JSON.stringify(formattedNotes));
        } else if (response.status === 401) {
          // Not authenticated, use localStorage fallback
          const savedNotes = localStorage.getItem(NOTES_KEY);
          if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
          }
        }
      } catch (error) {
        console.error('Error loading notes from API:', error);
        const savedNotes = localStorage.getItem(NOTES_KEY);
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
      } finally {
        setIsLoadingNotes(false);
      }
    };

    loadNotes();
    
    const savedHighlights = localStorage.getItem(HIGHLIGHTS_KEY);
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
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
    // Find all highlights that overlap with the new one
    const overlappingHighlights = highlights.filter(h =>
      h.sectionId === highlight.sectionId &&
      h.subsectionId === highlight.subsectionId &&
      h.location === highlight.location &&
      (highlight.location === 'question' ? h.questionId === highlight.questionId : true) &&
      // Check for overlap
      h.startOffset < highlight.endOffset && h.endOffset > highlight.startOffset
    );

    if (overlappingHighlights.length === 0) {
      // No overlap, just add the new highlight
      const newHighlight: Highlight = {
        ...highlight,
        id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      saveHighlights([...highlights, newHighlight]);
      return newHighlight.id;
    } else {
      // Merge overlapping highlights
      const mergedStart = Math.min(highlight.startOffset, ...overlappingHighlights.map(h => h.startOffset));
      const mergedEnd = Math.max(highlight.endOffset, ...overlappingHighlights.map(h => h.endOffset));
      const mergedText = highlight.text; // Use the newly selected text as the merged text

      // Remove overlapping highlights and add the merged one
      const filteredHighlights = highlights.filter(h => !overlappingHighlights.includes(h));
      const mergedHighlight: Highlight = {
        ...highlight,
        id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startOffset: mergedStart,
        endOffset: mergedEnd,
        text: mergedText,
      };
      saveHighlights([...filteredHighlights, mergedHighlight]);
      return mergedHighlight.id;
    }
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
    
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    
    // Sync with API in background
    (async () => {
      try {
        await apiRequest('/api/notes', {
          method: 'POST',
          body: JSON.stringify({
            content: newNote.content,
            sectionId: newNote.sectionId,
            subsectionId: newNote.subsectionId,
            location: newNote.location,
            questionId: newNote.questionId,
            positionX: newNote.position.x,
            positionY: newNote.position.y,
          }),
        });
      } catch (error) {
        console.error('Error creating note on server:', error);
      }
    })();
    
    return newNote.id;
  }, [notes, saveNotes]);

  const updateNote = useCallback((id: string, content: string) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, content } : n);
    saveNotes(updatedNotes);
    
    // Only sync if it's a database note (has UUID format)
    if (id.length === 36) {
      (async () => {
        try {
          await apiRequest(`/api/notes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ content }),
          });
        } catch (error) {
          console.error('Error updating note on server:', error);
        }
      })();
    }
  }, [notes, saveNotes]);

  const removeNote = useCallback((id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
    
    // Only sync if it's a database note (has UUID format)
    if (id.length === 36) {
      (async () => {
        try {
          await apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Error deleting note on server:', error);
        }
      })();
    }
  }, [notes, saveNotes]);

  const updateNotePosition = useCallback((id: string, position: { x: number; y: number }) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, position } : n);
    saveNotes(updatedNotes);
    
    // Only sync if it's a database note (has UUID format)
    if (id.length === 36) {
      (async () => {
        try {
          await apiRequest(`/api/notes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              positionX: position.x,
              positionY: position.y,
            }),
          });
        } catch (error) {
          console.error('Error updating note position on server:', error);
        }
      })();
    }
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
    isLoadingNotes,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    updateNotePosition,
    getHighlightsForSection,
    getNotesForSection,
  };
}
