import { useState, useEffect, useCallback } from 'react';

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
  const [responses, setResponses] = useState<QuestionResponse[]>([]);

  useEffect(() => {
    const savedResponses = localStorage.getItem(RESPONSES_KEY);
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  const saveResponses = useCallback((newResponses: QuestionResponse[]) => {
    setResponses(newResponses);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(newResponses));
  }, []);

  const recordResponse = useCallback((response: Omit<QuestionResponse, 'timestamp'>) => {
    const newResponse: QuestionResponse = {
      ...response,
      timestamp: Date.now(),
    };

    // Remove any existing response for this question and add new one
    const updatedResponses = [
      ...responses.filter(r => r.questionId !== response.questionId),
      newResponse,
    ];
    saveResponses(updatedResponses);
  }, [responses, saveResponses]);

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

  const resetSubsection = useCallback((sectionId: string, subsectionId: string) => {
    const updatedResponses = responses.filter(
      r => !(r.sectionId === sectionId && r.subsectionId === subsectionId)
    );
    saveResponses(updatedResponses);
  }, [responses, saveResponses]);

  const resetAll = useCallback(() => {
    saveResponses([]);
  }, [saveResponses]);

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
    resetSubsection,
    resetAll,
    getAllStats,
  };
}
