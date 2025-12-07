import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Highlight as DBHighlight, User } from '@shared/schema';

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
  const [localHighlights, setLocalHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const hasSyncedRef = useRef(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
  });

  const isAuthenticated = !!user;

  const { data: serverHighlights = [], isLoading: isLoadingHighlights, isError } = useQuery<DBHighlight[]>({
    queryKey: ['/api/highlights'],
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const createHighlightMutation = useMutation({
    mutationFn: async (highlight: Omit<Highlight, 'id'>) => {
      return await apiRequest('/api/highlights', {
        method: 'POST',
        body: JSON.stringify({
          text: highlight.text,
          color: highlight.color,
          sectionId: highlight.sectionId,
          subsectionId: highlight.subsectionId,
          location: highlight.location,
          questionId: highlight.questionId || null,
          startOffset: highlight.startOffset,
          endOffset: highlight.endOffset,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highlights'] });
    },
    onError: (error) => {
      console.error('[Highlights] Error creating highlight:', error);
    },
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/highlights/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highlights'] });
    },
    onError: (error) => {
      console.error('[Highlights] Error deleting highlight:', error);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (highlights: Highlight[]) => {
      return await apiRequest('/api/highlights/sync', {
        method: 'POST',
        body: JSON.stringify({
          highlights: highlights.map(h => ({
            text: h.text,
            color: h.color,
            sectionId: h.sectionId,
            subsectionId: h.subsectionId,
            location: h.location,
            questionId: h.questionId || null,
            startOffset: h.startOffset,
            endOffset: h.endOffset,
          })),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highlights'] });
    },
    onError: (error) => {
      console.error('[Highlights] Error syncing highlights:', error);
    },
  });

  useEffect(() => {
    const savedHighlights = localStorage.getItem(HIGHLIGHTS_KEY);
    if (savedHighlights) {
      try {
        setLocalHighlights(JSON.parse(savedHighlights));
      } catch (e) {
        console.error('[Highlights] Error parsing localStorage:', e);
      }
    }
    
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('[Notes] Error parsing localStorage:', e);
      }
    }
    setIsLoadingNotes(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    const loadNotesFromServer = async () => {
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
        }
      } catch (error) {
        console.error('Error loading notes from API:', error);
      }
    };

    loadNotesFromServer();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || isLoadingHighlights || isError || hasSyncedRef.current) {
      return;
    }
    
    hasSyncedRef.current = true;
    
    const savedHighlights = localStorage.getItem(HIGHLIGHTS_KEY);
    if (savedHighlights) {
      try {
        const localData = JSON.parse(savedHighlights) as Highlight[];
        const localOnlyHighlights = localData.filter(local => 
          !serverHighlights.some(server =>
            server.sectionId === local.sectionId &&
            server.subsectionId === local.subsectionId &&
            server.location === local.location &&
            server.startOffset === local.startOffset &&
            server.endOffset === local.endOffset
          )
        );
        
        if (localOnlyHighlights.length > 0) {
          console.log(`[Highlights] Syncing ${localOnlyHighlights.length} local highlights to server`);
          syncMutation.mutate(localOnlyHighlights);
        }
      } catch (e) {
        console.error('[Highlights] Error during sync:', e);
      }
    }
  }, [isAuthenticated, isLoadingHighlights, isError, serverHighlights, syncMutation]);

  const highlights: Highlight[] = (isAuthenticated && serverHighlights.length > 0)
    ? serverHighlights.map(h => ({
        id: h.id,
        text: h.text,
        color: h.color as HighlightColor,
        sectionId: h.sectionId,
        subsectionId: h.subsectionId,
        location: h.location as 'reference' | 'question',
        questionId: h.questionId || undefined,
        startOffset: h.startOffset,
        endOffset: h.endOffset,
      }))
    : localHighlights;

  const saveHighlightsToLocal = useCallback((newHighlights: Highlight[]) => {
    setLocalHighlights(newHighlights);
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
    
    const currentHighlights = (isAuthenticated && serverHighlights.length > 0)
      ? serverHighlights.map(h => ({
          id: h.id,
          text: h.text,
          color: h.color as HighlightColor,
          sectionId: h.sectionId,
          subsectionId: h.subsectionId,
          location: h.location as 'reference' | 'question',
          questionId: h.questionId || undefined,
          startOffset: h.startOffset,
          endOffset: h.endOffset,
        }))
      : localHighlights;
    
    saveHighlightsToLocal([...currentHighlights, newHighlight]);
    if (isAuthenticated) {
      createHighlightMutation.mutate(highlight);
    }
    return newHighlight.id;
  }, [isAuthenticated, localHighlights, serverHighlights, saveHighlightsToLocal, createHighlightMutation]);

  const removeHighlight = useCallback((id: string) => {
    const currentHighlights = (isAuthenticated && serverHighlights.length > 0)
      ? serverHighlights.map(h => ({
          id: h.id,
          text: h.text,
          color: h.color as HighlightColor,
          sectionId: h.sectionId,
          subsectionId: h.subsectionId,
          location: h.location as 'reference' | 'question',
          questionId: h.questionId || undefined,
          startOffset: h.startOffset,
          endOffset: h.endOffset,
        }))
      : localHighlights;
    
    saveHighlightsToLocal(currentHighlights.filter(h => h.id !== id));
    saveNotes(notes.filter(n => n.highlightId !== id));
    
    if (isAuthenticated && id.length === 36) {
      deleteHighlightMutation.mutate(id);
    }
  }, [isAuthenticated, localHighlights, serverHighlights, notes, saveHighlightsToLocal, saveNotes, deleteHighlightMutation]);

  const batchRemoveHighlights = useCallback((ids: string[]) => {
    const currentHighlights = (isAuthenticated && serverHighlights.length > 0)
      ? serverHighlights.map(h => ({
          id: h.id,
          text: h.text,
          color: h.color as HighlightColor,
          sectionId: h.sectionId,
          subsectionId: h.subsectionId,
          location: h.location as 'reference' | 'question',
          questionId: h.questionId || undefined,
          startOffset: h.startOffset,
          endOffset: h.endOffset,
        }))
      : localHighlights;
    
    const newHighlights = currentHighlights.filter(h => !ids.includes(h.id));
    saveHighlightsToLocal(newHighlights);
    saveNotes(notes.filter(n => !ids.includes(n.highlightId || '')));
    
    if (isAuthenticated) {
      for (const id of ids) {
        if (id.length === 36) {
          deleteHighlightMutation.mutate(id);
        }
      }
    }
  }, [isAuthenticated, localHighlights, serverHighlights, notes, saveHighlightsToLocal, saveNotes, deleteHighlightMutation]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'timestamp'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    
    if (isAuthenticated) {
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
    }
    
    return newNote.id;
  }, [isAuthenticated, notes, saveNotes]);

  const updateNote = useCallback((id: string, content: string) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, content } : n);
    saveNotes(updatedNotes);
    
    if (isAuthenticated && id.length === 36) {
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
  }, [isAuthenticated, notes, saveNotes]);

  const removeNote = useCallback((id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
    
    if (isAuthenticated && id.length === 36) {
      (async () => {
        try {
          await apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Error deleting note on server:', error);
        }
      })();
    }
  }, [isAuthenticated, notes, saveNotes]);

  const updateNotePosition = useCallback((id: string, position: { x: number; y: number }) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, position } : n);
    saveNotes(updatedNotes);
    
    if (isAuthenticated && id.length === 36) {
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
  }, [isAuthenticated, notes, saveNotes]);

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
    isLoadingHighlights,
    addHighlight,
    removeHighlight,
    batchRemoveHighlights,
    addNote,
    updateNote,
    removeNote,
    updateNotePosition,
    getHighlightsForSection,
    getNotesForSection,
  };
}
