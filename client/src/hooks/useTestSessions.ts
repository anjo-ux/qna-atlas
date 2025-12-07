import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Question } from '@/types/question';
import { QuestionResponse } from './useQuestionStats';
import type { TestSession as DbTestSession } from '@shared/schema';

// Frontend test session interface extends database schema with local data
export interface TestSession {
  id: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  status: 'in-progress' | 'completed';
  questionCount: number;
  selectedSectionIds: string[];
  useAllQuestions: boolean;
  questions: Question[];
  responses: Record<string, QuestionResponse>;
  currentQuestionIndex: number;
  flaggedQuestionIds?: string[];
}

// Local storage key for questions (since they come from Excel file)
const QUESTIONS_KEY = 'psite-test-questions';

export function useTestSessions() {
  // Fetch all test sessions from database
  const { data: dbSessions = [], isLoading } = useQuery<DbTestSession[]>({
    queryKey: ['/api/test-sessions'],
    retry: 1,
  });

  // Convert database sessions to frontend sessions
  const sessions: TestSession[] = dbSessions.map(dbSession => {
    return {
      id: dbSession.id,
      createdAt: new Date(dbSession.createdAt).getTime(),
      completedAt: dbSession.completedAt ? new Date(dbSession.completedAt).getTime() : undefined,
      status: dbSession.status as 'in-progress' | 'completed',
      questionCount: dbSession.questionCount,
      selectedSectionIds: dbSession.selectedSectionIds,
      useAllQuestions: dbSession.useAllQuestions,
      questions: (dbSession.questions as any) || [],
      responses: {},
      currentQuestionIndex: dbSession.currentQuestionIndex,
      flaggedQuestionIds: dbSession.flaggedQuestionIds || [],
    };
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: {
      questionCount: number;
      selectedSectionIds: string[];
      useAllQuestions: boolean;
      questions: Question[];
    }) => {
      // Create session in database with questions
      const response = await apiRequest('/api/test-sessions', {
        method: 'POST',
        body: JSON.stringify({
          questionCount: data.questionCount,
          selectedSectionIds: data.selectedSectionIds,
          useAllQuestions: data.useAllQuestions,
          questions: data.questions,
          currentQuestionIndex: 0,
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-sessions'] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: {
      sessionId: string;
      updates: Partial<TestSession>;
    }) => {
      // Update session in database
      const dbUpdates: any = {};
      if (updates.currentQuestionIndex !== undefined) {
        dbUpdates.currentQuestionIndex = updates.currentQuestionIndex;
      }
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
      }
      if (updates.questions !== undefined) {
        dbUpdates.questions = updates.questions;
      }
      if (updates.flaggedQuestionIds !== undefined) {
        dbUpdates.flaggedQuestionIds = updates.flaggedQuestionIds;
      }

      const response = await apiRequest(`/api/test-sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(dbUpdates),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-sessions'] });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest(`/api/test-sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-sessions'] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      // Delete session from database
      await apiRequest(`/api/test-sessions/${sessionId}`, {
        method: 'DELETE',
      });
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-sessions'] });
    },
  });

  return {
    sessions,
    isLoading,
    createSession: async (
      questionCount: number,
      selectedSectionIds: string[],
      useAllQuestions: boolean,
      questions: Question[]
    ) => {
      const result = await createSessionMutation.mutateAsync({
        questionCount,
        selectedSectionIds,
        useAllQuestions,
        questions,
      });
      
      // Return the created session from the database
      return {
        id: result.id,
        createdAt: new Date(result.createdAt).getTime(),
        status: result.status as 'in-progress' | 'completed',
        questionCount: result.questionCount,
        selectedSectionIds: result.selectedSectionIds,
        useAllQuestions: result.useAllQuestions,
        questions,
        responses: {},
        currentQuestionIndex: result.currentQuestionIndex,
      };
    },
    updateSession: (sessionId: string, updates: Partial<TestSession>) => {
      updateSessionMutation.mutate({ sessionId, updates });
    },
    completeSession: (sessionId: string) => {
      completeSessionMutation.mutate(sessionId);
    },
    deleteSession: async (sessionId: string) => {
      await deleteSessionMutation.mutateAsync(sessionId);
    },
    getSession: (sessionId: string): TestSession | undefined => {
      return sessions.find(s => s.id === sessionId);
    },
    getRecentSessions: (limit: number = 5): TestSession[] => {
      return [...sessions]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    },
    getInProgressSessions: (): TestSession[] => {
      return sessions.filter(s => s.status === 'in-progress');
    },
    getCompletedSessions: (): TestSession[] => {
      return sessions.filter(s => s.status === 'completed');
    },
  };
}
