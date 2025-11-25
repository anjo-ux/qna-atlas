import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Bookmark } from '@shared/schema';

export function useBookmarks() {
  // Fetch all bookmarks for the user
  const { data: bookmarks = [], isLoading } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks'],
  });

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: async (data: { questionId: string; sectionId: string; subsectionId: string }) => {
      return await apiRequest('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
    },
  });

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return await apiRequest(`/api/bookmarks/${questionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
    },
  });

  // Check if a question is bookmarked
  const isBookmarked = (questionId: string): boolean => {
    return bookmarks.some(b => b.questionId === questionId);
  };

  // Toggle bookmark
  const toggleBookmark = async (questionId: string, sectionId: string, subsectionId: string) => {
    if (isBookmarked(questionId)) {
      await removeBookmarkMutation.mutateAsync(questionId);
    } else {
      await addBookmarkMutation.mutateAsync({ questionId, sectionId, subsectionId });
    }
  };

  return {
    bookmarks,
    isLoading,
    isBookmarked,
    toggleBookmark,
    addBookmark: (questionId: string, sectionId: string, subsectionId: string) =>
      addBookmarkMutation.mutateAsync({ questionId, sectionId, subsectionId }),
    removeBookmark: (questionId: string) => removeBookmarkMutation.mutateAsync(questionId),
    isPending: addBookmarkMutation.isPending || removeBookmarkMutation.isPending,
  };
}
