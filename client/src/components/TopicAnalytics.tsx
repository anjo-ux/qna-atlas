import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTopicAnalytics } from '@/hooks/useTopicAnalytics';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export function TopicAnalytics() {
  const { topics, isLoading, overallStats, weakestTopics, strongestTopics } = useTopicAnalytics();

  if (isLoading) {
    return (
      <Card variant="glass" className="p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card variant="glass" className="p-6 text-center">
        <p className="text-muted-foreground">No data yet. Answer questions to see topic-based analytics.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card variant="glass" className="p-4 md:p-6 glow-primary transition-glow">
        <h2 className="text-lg font-semibold mb-4 gradient-text">Topic Performance Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Answered</p>
            <p className="text-2xl md:text-3xl font-bold">{overallStats.total}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Correct</p>
            <p className="text-2xl md:text-3xl font-bold text-success">{overallStats.correct}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Accuracy</p>
            <p className="text-2xl md:text-3xl font-bold text-accent">{overallStats.accuracy}%</p>
          </div>
        </div>
      </Card>

      {/* Topic Breakdown */}
      <Card variant="glass" className="p-4 md:p-6 glow-accent transition-glow">
        <h3 className="text-lg font-semibold mb-4 gradient-text">All Topics</h3>
        <div className="space-y-4">
          {topics.map(topic => (
            <div key={topic.sectionId} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{topic.sectionId}</p>
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  topic.accuracy >= 80 ? "bg-success/20 text-success" :
                  topic.accuracy >= 60 ? "bg-accent/20 text-accent" :
                  "bg-destructive/20 text-destructive"
                )}>
                  {topic.accuracy}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={topic.accuracy} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">{topic.correct}/{topic.total}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Needs Work */}
      {weakestTopics.length > 0 && (
        <Card variant="glass" className="p-4 md:p-6 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Topics Needing Focus</h3>
          </div>
          <div className="space-y-2">
            {weakestTopics.map(topic => (
              <div key={topic.sectionId} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                <span className="text-sm">{topic.sectionId}</span>
                <span className="text-xs font-bold text-destructive">{topic.accuracy}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strongest Topics */}
      {strongestTopics.length > 0 && (
        <Card variant="glass" className="p-4 md:p-6 border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="font-semibold">You're Excelling At</h3>
          </div>
          <div className="space-y-2">
            {strongestTopics.map(topic => (
              <div key={topic.sectionId} className="flex items-center justify-between p-2 rounded bg-success/5">
                <span className="text-sm">{topic.sectionId}</span>
                <span className="text-xs font-bold text-success">{topic.accuracy}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card variant="glass" className="p-4 md:p-6 border-accent/20">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold mb-1 text-sm">Pro Tip</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Focus spaced repetition on your weakest topics first. Review them regularly to improve your accuracy and boost your overall performance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
