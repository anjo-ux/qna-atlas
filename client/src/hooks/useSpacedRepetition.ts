import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { SpacedRepetition } from '@shared/schema';

export interface SpacedRepetitionDueResponse {
  due: SpacedRepetition[];
  reviewedQuestionIds: string[];
  incorrectQuestionIds: string[];
}

export function useSpacedRepetition() {
  // Fetch questions due for review and IDs of all questions ever in SR
  const { data, isLoading } = useQuery<SpacedRepetitionDueResponse | SpacedRepetition[]>({
    queryKey: ['/api/spaced-repetition/due'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, { credentials: 'include' });
        if (!res.ok) return { due: [], reviewedQuestionIds: [], incorrectQuestionIds: [] };
        const json = await res.json();
        return json;
      } catch {
        return { due: [], reviewedQuestionIds: [], incorrectQuestionIds: [] };
      }
    },
  });

  // Support both new shape { due, reviewedQuestionIds, incorrectQuestionIds } and legacy array response
  const dueQuestions = Array.isArray(data) ? data : (data?.due ?? []);
  const reviewedQuestionIds = Array.isArray(data) ? [] : (data?.reviewedQuestionIds ?? []);
  const incorrectQuestionIds = Array.isArray(data) ? [] : (data?.incorrectQuestionIds ?? []);

  // Get SR data for a specific question
  const getSRData = async (questionId: string): Promise<SpacedRepetition> => {
    return await apiRequest(`/api/spaced-repetition/${questionId}`, { method: 'GET' });
  };

  // Update SR based on answer quality (0-5 scale, where 3+ is correct)
  const updateSRMutation = useMutation({
    mutationFn: async (data: {
      questionId: string;
      sectionId: string;
      subsectionId: string;
      quality: number; // 0-5, where 0 = worst, 5 = best
    }) => {
      return await apiRequest('/api/spaced-repetition/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spaced-repetition/due'] });
    },
  });

  return {
    dueQuestions,
    reviewedQuestionIds,
    incorrectQuestionIds,
    dueCount: dueQuestions.length,
    incorrectCount: incorrectQuestionIds.length,
    isLoading,
    getSRData,
    updateSR: (questionId: string, sectionId: string, subsectionId: string, quality: number) =>
      updateSRMutation.mutateAsync({ questionId, sectionId, subsectionId, quality }),
    isPending: updateSRMutation.isPending,
  };
}
