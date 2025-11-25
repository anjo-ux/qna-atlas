import { useQuery } from '@tanstack/react-query';

export interface TopicStat {
  sectionId: string;
  sectionTitle?: string;
  total: number;
  correct: number;
  accuracy: number;
}

export function useTopicAnalytics(sectionId?: string) {
  const queryKey = sectionId 
    ? ['/api/analytics/topics', sectionId]
    : ['/api/analytics/topics'];

  const { data: topics = [], isLoading, error } = useQuery<TopicStat[]>({
    queryKey,
  });

  // Get overall stats
  const overallStats = {
    total: topics.reduce((sum, t) => sum + t.total, 0),
    correct: topics.reduce((sum, t) => sum + t.correct, 0),
    accuracy: topics.length > 0
      ? Math.round(topics.reduce((sum, t) => sum + t.accuracy * t.total, 0) / topics.reduce((sum, t) => sum + t.total, 0))
      : 0,
  };

  // Get weakest and strongest topics
  const sortedByAccuracy = [...topics].sort((a, b) => a.accuracy - b.accuracy);
  const weakestTopics = sortedByAccuracy.slice(0, 3);
  const strongestTopics = sortedByAccuracy.slice(-3).reverse();

  return {
    topics,
    isLoading,
    error,
    overallStats,
    weakestTopics,
    strongestTopics,
  };
}
