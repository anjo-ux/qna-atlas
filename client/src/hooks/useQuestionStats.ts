import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { QuestionResponse as DBQuestionResponse, User } from '@shared/schema';

export interface QuestionResponse {
  questionId: string;
  sectionId: string;
  subsectionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface SubsectionStats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
}

const RESPONSES_KEY = 'psite-question-responses';

export function useQuestionStats() {
  const [localResponses, setLocalResponses] = useState<QuestionResponse[]>([]);
  const hasSyncedRef = useRef(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
  });

  const isAuthenticated = !!user;

  const { data: serverResponses = [], isLoading: isServerLoading, isError } = useQuery<DBQuestionResponse[]>({
    queryKey: ['/api/question-responses'],
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const saveResponseMutation = useMutation({
    mutationFn: async (response: QuestionResponse) => {
      return await apiRequest(`/api/question-responses/${encodeURIComponent(response.questionId)}`, {
        method: 'PUT',
        body: JSON.stringify({
          sectionId: response.sectionId,
          subsectionId: response.subsectionId,
          selectedAnswer: response.selectedAnswer,
          correctAnswer: response.correctAnswer,
          isCorrect: response.isCorrect,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-responses'] });
    },
    onError: (error) => {
      console.error('[QuestionStats] Error saving response:', error);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (responses: QuestionResponse[]) => {
      return await apiRequest('/api/question-responses/sync', {
        method: 'POST',
        body: JSON.stringify({
          responses: responses.map(r => ({
            questionId: r.questionId,
            sectionId: r.sectionId,
            subsectionId: r.subsectionId,
            selectedAnswer: r.selectedAnswer,
            correctAnswer: r.correctAnswer,
            isCorrect: r.isCorrect,
          })),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-responses'] });
    },
    onError: (error) => {
      console.error('[QuestionStats] Error syncing responses:', error);
    },
  });

  useEffect(() => {
    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    if (savedResponses) {
      try {
        setLocalResponses(JSON.parse(savedResponses));
      } catch (e) {
        console.error('[QuestionStats] Error parsing localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isServerLoading || isError || hasSyncedRef.current) {
      return;
    }
    
    hasSyncedRef.current = true;
    
    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    if (savedResponses) {
      try {
        const localData = JSON.parse(savedResponses) as QuestionResponse[];
        const serverQuestionIds = new Set(serverResponses.map(r => r.questionId));
        const localOnlyResponses = localData.filter(r => !serverQuestionIds.has(r.questionId));
        
        if (localOnlyResponses.length > 0) {
          console.log(`[QuestionStats] Syncing ${localOnlyResponses.length} local responses to server`);
          syncMutation.mutate(localOnlyResponses);
        }
      } catch (e) {
        console.error('[QuestionStats] Error during sync:', e);
      }
    }
  }, [isAuthenticated, isServerLoading, isError, serverResponses, syncMutation]);

  const responses: QuestionResponse[] = (isAuthenticated && serverResponses.length > 0)
    ? serverResponses.map(r => ({
        questionId: r.questionId,
        sectionId: r.sectionId,
        subsectionId: r.subsectionId,
        selectedAnswer: r.selectedAnswer,
        correctAnswer: r.correctAnswer || '',
        isCorrect: r.isCorrect,
        timestamp: r.answeredAt ? new Date(r.answeredAt).getTime() : Date.now(),
      }))
    : localResponses;

  const saveToLocalStorage = useCallback((newResponses: QuestionResponse[]) => {
    setLocalResponses(newResponses);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(newResponses));
  }, []);

  const recordResponse = useCallback((response: Omit<QuestionResponse, 'timestamp'>) => {
    const newResponse: QuestionResponse = {
      ...response,
      timestamp: Date.now(),
    };

    const currentResponses = (isAuthenticated && serverResponses.length > 0)
      ? serverResponses.map(r => ({
          questionId: r.questionId,
          sectionId: r.sectionId,
          subsectionId: r.subsectionId,
          selectedAnswer: r.selectedAnswer,
          correctAnswer: r.correctAnswer || '',
          isCorrect: r.isCorrect,
          timestamp: r.answeredAt ? new Date(r.answeredAt).getTime() : Date.now(),
        }))
      : localResponses;

    const updatedResponses = [
      ...currentResponses.filter(r => r.questionId !== response.questionId),
      newResponse,
    ];
    
    saveToLocalStorage(updatedResponses);
    if (isAuthenticated) {
      saveResponseMutation.mutate(newResponse);
    }
  }, [isAuthenticated, serverResponses, localResponses, saveToLocalStorage, saveResponseMutation]);

  const getQuestionResponse = useCallback((questionId: string): QuestionResponse | undefined => {
    return responses.find(r => r.questionId === questionId);
  }, [responses]);

  const getSubsectionStats = useCallback((
    sectionId: string,
    subsectionId: string,
    totalQuestions: number
  ): SubsectionStats => {
    const subsectionResponses = responses.filter(
      r => r.sectionId === sectionId && r.subsectionId === subsectionId
    );

    const correct = subsectionResponses.filter(r => r.isCorrect).length;
    const incorrect = subsectionResponses.filter(r => !r.isCorrect).length;

    return {
      total: totalQuestions,
      answered: subsectionResponses.length,
      correct,
      incorrect,
    };
  }, [responses]);

  const getIncorrectQuestionIds = useCallback((
    sectionId: string,
    subsectionId: string
  ): string[] => {
    return responses
      .filter(r => 
        r.sectionId === sectionId && 
        r.subsectionId === subsectionId && 
        !r.isCorrect
      )
      .map(r => r.questionId);
  }, [responses]);

  const getUnansweredQuestionIds = useCallback((
    sectionId: string,
    subsectionId: string,
    totalQuestionIds: string[]
  ): string[] => {
    const answeredIds = new Set(
      responses
        .filter(r => 
          r.sectionId === sectionId && 
          r.subsectionId === subsectionId
        )
        .map(r => r.questionId)
    );
    return totalQuestionIds.filter(id => !answeredIds.has(id));
  }, [responses]);

  const resetSubsection = useCallback((sectionId: string, subsectionId: string) => {
    const updatedResponses = responses.filter(
      r => !(r.sectionId === sectionId && r.subsectionId === subsectionId)
    );
    saveToLocalStorage(updatedResponses);
  }, [responses, saveToLocalStorage]);

  const resetAll = useCallback(() => {
    saveToLocalStorage([]);
  }, [saveToLocalStorage]);

  const getAllStats = useCallback(() => {
    const total = responses.length;
    const correct = responses.filter(r => r.isCorrect).length;
    const incorrect = responses.filter(r => !r.isCorrect).length;

    return { total, correct, incorrect };
  }, [responses]);

  return {
    responses,
    recordResponse,
    getQuestionResponse,
    getSubsectionStats,
    getIncorrectQuestionIds,
    getUnansweredQuestionIds,
    resetSubsection,
    resetAll,
    getAllStats,
    isLoading: isServerLoading,
    isPending: saveResponseMutation.isPending,
  };
}
