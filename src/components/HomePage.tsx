import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { Section } from '@/types/question';
import { BookOpen, CheckCircle2, XCircle, TrendingUp, Target } from 'lucide-react';
import { useMemo } from 'react';

interface HomePageProps {
  sections: Section[];
}

export function HomePage({ sections }: HomePageProps) {
  const { getAllStats, responses, getSubsectionStats } = useQuestionStats();
  const overallStats = getAllStats();
  
  const accuracyPercentage = overallStats.total > 0 
    ? Math.round((overallStats.correct / overallStats.total) * 100) 
    : 0;

  // Calculate total questions available
  const totalQuestions = useMemo(() => {
    return sections.reduce((acc, section) => {
      return acc + section.subsections.reduce((subAcc, subsection) => {
        return subAcc + subsection.questions.length;
      }, 0);
    }, 0);
  }, [sections]);

  // Calculate progress by section
  const sectionProgress = useMemo(() => {
    return sections.map(section => {
      let totalSectionQuestions = 0;
      let answeredQuestions = 0;
      let correctQuestions = 0;

      section.subsections.forEach(subsection => {
        const stats = getSubsectionStats(section.id, subsection.id, subsection.questions.length);
        totalSectionQuestions += subsection.questions.length;
        answeredQuestions += stats.answered;
        correctQuestions += stats.correct;
      });

      const percentage = totalSectionQuestions > 0 
        ? Math.round((answeredQuestions / totalSectionQuestions) * 100)
        : 0;
      
      const accuracy = answeredQuestions > 0
        ? Math.round((correctQuestions / answeredQuestions) * 100)
        : 0;

      return {
        section,
        totalSectionQuestions,
        answeredQuestions,
        correctQuestions,
        percentage,
        accuracy
      };
    });
  }, [sections, getSubsectionStats]);

  // Get recent activity (last 7 days)
  const recentActivity = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentResponses = responses.filter(r => r.timestamp >= sevenDaysAgo);
    const correct = recentResponses.filter(r => r.isCorrect).length;
    
    return {
      total: recentResponses.length,
      correct,
      accuracy: recentResponses.length > 0 
        ? Math.round((correct / recentResponses.length) * 100)
        : 0
    };
  }, [responses]);

  const completionPercentage = totalQuestions > 0
    ? Math.round((overallStats.total / totalQuestions) * 100)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          PSITE Review Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and master your plastic surgery knowledge
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-1/20">
              <BookOpen className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold text-foreground">{overallStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-chart-3/10 to-success/10 border-success/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/20">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-2xl font-bold text-success">{overallStats.correct}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-destructive/20">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="text-2xl font-bold text-destructive">{overallStats.incorrect}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/20">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold text-accent">{accuracyPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Questions Completed</span>
                <span className="text-sm font-semibold">{overallStats.total} / {totalQuestions}</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% complete</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                <span className="text-sm font-semibold">{accuracyPercentage}%</span>
              </div>
              <Progress value={accuracyPercentage} className="h-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity (7 Days)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-2xl font-bold">{recentActivity.total}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-success">{recentActivity.accuracy}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="text-xl font-bold text-success">{recentActivity.correct}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-xs text-muted-foreground">Incorrect</p>
                <p className="text-xl font-bold text-destructive">{recentActivity.total - recentActivity.correct}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Section Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Progress by Section</h2>
        <div className="space-y-4">
          {sectionProgress.map(({ section, totalSectionQuestions, answeredQuestions, percentage, accuracy }) => (
            <div key={section.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-foreground">{section.title}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {answeredQuestions} / {totalSectionQuestions}
                  </span>
                  <span className="text-sm font-semibold text-primary">{percentage}%</span>
                  {answeredQuestions > 0 && (
                    <span className="text-sm text-success">({accuracy}% accurate)</span>
                  )}
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Get Started Message */}
      {overallStats.total === 0 && (
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to Begin?</h3>
          <p className="text-muted-foreground">
            Select a section from the navigation menu to start answering questions and track your progress
          </p>
        </Card>
      )}
    </div>
  );
}
