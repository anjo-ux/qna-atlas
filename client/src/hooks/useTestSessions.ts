import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/question';
import { QuestionResponse } from './useQuestionStats';

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
}

const SESSIONS_KEY = 'psite-test-sessions';

export function useTestSessions() {
  const [sessions, setSessions] = useState<TestSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  const saveSessions = useCallback((newSessions: TestSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
  }, []);

  const createSession = useCallback((
    questionCount: number,
    selectedSectionIds: string[],
    useAllQuestions: boolean,
    questions: Question[]
  ): TestSession => {
    const session: TestSession = {
      id: `test-${Date.now()}`,
      createdAt: Date.now(),
      status: 'in-progress',
      questionCount,
      selectedSectionIds,
      useAllQuestions,
      questions,
      responses: {},
      currentQuestionIndex: 0,
    };

    saveSessions([...sessions, session]);
    return session;
  }, [sessions, saveSessions]);

  const updateSession = useCallback((sessionId: string, updates: Partial<TestSession>) => {
    const updated = sessions.map(s =>
      s.id === sessionId ? { ...s, ...updates } : s
    );
    saveSessions(updated);
  }, [sessions, saveSessions]);

  const completeSession = useCallback((sessionId: string) => {
    const updated = sessions.map(s =>
      s.id === sessionId ? { ...s, status: 'completed', completedAt: Date.now() } : s
    );
    saveSessions(updated);
  }, [sessions, saveSessions]);

  const deleteSession = useCallback((sessionId: string) => {
    saveSessions(sessions.filter(s => s.id !== sessionId));
  }, [sessions, saveSessions]);

  const getSession = useCallback((sessionId: string): TestSession | undefined => {
    return sessions.find(s => s.id === sessionId);
  }, [sessions]);

  const getRecentSessions = useCallback((limit: number = 5): TestSession[] => {
    return [...sessions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }, [sessions]);

  const getInProgressSessions = useCallback((): TestSession[] => {
    return sessions.filter(s => s.status === 'in-progress');
  }, [sessions]);

  const getCompletedSessions = useCallback((): TestSession[] => {
    return sessions.filter(s => s.status === 'completed');
  }, [sessions]);

  return {
    sessions,
    createSession,
    updateSession,
    completeSession,
    deleteSession,
    getSession,
    getRecentSessions,
    getInProgressSessions,
    getCompletedSessions,
  };
}
