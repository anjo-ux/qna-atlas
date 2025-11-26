import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { Bookmark } from '@shared/schema';

export function useBookmarks() {
  // Fetch all bookmarks for the user
  const { data: bookmarks = [], isLoading } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks'],
  });

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: async (data: { questionId: string; sectionId: string; subsectionId: string }) => {
      console.log('[Bookmark] Adding bookmark with data:', data);
      if (!data.questionId || !data.sectionId || !data.subsectionId) {
        console.error('[Bookmark] Missing required fields:', data);
        throw new Error(`Missing required fields: ${!data.questionId ? 'questionId ' : ''}${!data.sectionId ? 'sectionId ' : ''}${!data.subsectionId ? 'subsectionId' : ''}`);
      }
      return await apiRequest('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('Question bookmarked!');
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
    },
    onError: (error: any) => {
      console.error('[Bookmark] Error adding bookmark:', error);
      const message = error.message || 'Failed to bookmark question';
      toast.error(message);
    },
  });

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (questionId: string) => {
      console.log('[Bookmark] Removing bookmark for question:', questionId);
      try {
        const response = await apiRequest(`/api/bookmarks/${questionId}`, {
          method: 'DELETE',
        });
        console.log('[Bookmark] Delete API response:', response);
        return response;
      } catch (error) {
        console.error('[Bookmark] apiRequest threw error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[Bookmark] onSuccess called - bookmark removed successfully');
      toast.success('Bookmark removed!');
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
    },
    onError: (error: any) => {
      console.error('[Bookmark] onError called - Error removing bookmark:', error);
      const message = error.message || 'Failed to remove bookmark';
      toast.error(message);
    },
  });

  // Check if a question is bookmarked
  const isBookmarked = (questionId: string): boolean => {
    return bookmarks.some(b => b.questionId === questionId);
  };

  // Toggle bookmark
  const toggleBookmark = async (questionId: string, sectionId: string, subsectionId: string) => {
    console.log('[Bookmark] Toggle called with:', { questionId, sectionId, subsectionId });
    try {
      if (isBookmarked(questionId)) {
        console.log('[Bookmark] Question is bookmarked, calling removeBookmarkMutation');
        await removeBookmarkMutation.mutateAsync(questionId);
        console.log('[Bookmark] removeBookmarkMutation completed');
      } else {
        console.log('[Bookmark] Question is not bookmarked, calling addBookmarkMutation');
        await addBookmarkMutation.mutateAsync({ questionId, sectionId, subsectionId });
        console.log('[Bookmark] addBookmarkMutation completed');
      }
    } catch (error) {
      console.error('[Bookmark] toggleBookmark caught error:', error);
      throw error;
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
