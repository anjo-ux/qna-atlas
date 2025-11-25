import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { SpacedRepetition } from '@shared/schema';

export function useSpacedRepetition() {
  // Fetch questions due for review
  const { data: dueQuestions = [], isLoading } = useQuery<SpacedRepetition[]>({
    queryKey: ['/api/spaced-repetition/due'],
  });

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
    dueCount: dueQuestions.length,
    isLoading,
    getSRData,
    updateSR: (questionId: string, sectionId: string, subsectionId: string, quality: number) =>
      updateSRMutation.mutateAsync({ questionId, sectionId, subsectionId, quality }),
    isPending: updateSRMutation.isPending,
  };
}
