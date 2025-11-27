import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { useTestSessions } from '@/hooks/useTestSessions';
import { useAuth } from '@/hooks/useAuth';
import { TestHistory } from '@/components/TestHistory';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Section } from '@/types/question';
import { BookOpen, CheckCircle2, XCircle, TrendingUp, Target, ChevronRight, RotateCcw, AlertCircle, Zap, LogOut, User, Settings, Eye, Smile, Sparkles, Heart, Rocket, Brain, Flame, Crown, Coffee, Moon, Sun, Star } from 'lucide-react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HomePageProps {
  sections: Section[];
  onReviewIncorrect?: () => void;
  onStartTest?: () => void;
  onResumeTest?: (sessionId: string) => void;
  onSettings?: () => void;
  onPreview?: () => void;
}

export function HomePage({ sections, onReviewIncorrect, onStartTest, onResumeTest, onSettings, onPreview }: HomePageProps) {
  const { getAllStats, responses, getSubsectionStats, resetAll } = useQuestionStats();
  const { sessions, deleteSession } = useTestSessions();
  const { user, logout } = useAuth();
  const overallStats = getAllStats();

  const AVATAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    smile: Smile,
    sparkles: Sparkles,
    zap: Zap,
    heart: Heart,
    rocket: Rocket,
    brain: Brain,
    flame: Flame,
    crown: Crown,
    coffee: Coffee,
    moon: Moon,
    sun: Sun,
    star: Star,
  };

  const getAvatarIcon = () => {
    const iconId = user?.avatarIcon || 'smile';
    const IconComponent = AVATAR_ICONS[iconId] || Smile;
    return IconComponent;
  };
  
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

  // Calculate progress by section with subsection details
  const sectionProgress = useMemo(() => {
    return sections.map(section => {
      let totalSectionQuestions = 0;
      let answeredQuestions = 0;
      let correctQuestions = 0;

      const subsectionDetails = section.subsections.map(subsection => {
        const stats = getSubsectionStats(section.id, subsection.id, subsection.questions.length);
        totalSectionQuestions += subsection.questions.length;
        answeredQuestions += stats.answered;
        correctQuestions += stats.correct;

        const subsectionPercentage = subsection.questions.length > 0
          ? Math.round((stats.answered / subsection.questions.length) * 100)
          : 0;

        const subsectionAccuracy = stats.answered > 0
          ? Math.round((stats.correct / stats.answered) * 100)
          : 0;

        return {
          subsection,
          totalQuestions: subsection.questions.length,
          answered: stats.answered,
          correct: stats.correct,
          percentage: subsectionPercentage,
          accuracy: subsectionAccuracy,
        };
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
        accuracy,
        subsectionDetails,
      };
    });
  }, [sections, getSubsectionStats]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  }, [sessions]);

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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in overflow-auto flex-1">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Plastic Surgery In-Training Exam Review
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {user && (
              <span>Welcome back, {user.firstName || user.email?.split('@')[0]}. Track your progress and master your knowledge.</span>
            )}
            {!user && "Track your progress and master your knowledge."}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 sm:gap-2 px-2 sm:px-3 group" data-testid="button-user-menu">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const IconComponent = getAvatarIcon();
                    return <IconComponent className="w-4 h-4 text-primary group-hover:text-white" />;
                  })()}
                </div>
                <span className="hidden sm:inline truncate">{user?.firstName || user?.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSettings?.()} data-testid="button-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="w-4 h-4 mr-2" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {overallStats.incorrect > 0 && (
          <Button
            onClick={onReviewIncorrect}
            variant="outline"
            className="gap-2 text-xs sm:text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Review Incorrect ({overallStats.incorrect})</span>
            <span className="sm:hidden">Incorrect ({overallStats.incorrect})</span>
          </Button>
        )}
        
        {overallStats.total > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2 text-xs sm:text-sm">
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your question responses and progress. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <Card variant="glass" className="p-3 md:p-6 glow-primary transition-glow hover:glow-primary">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 rounded-lg bg-chart-1/20 flex-shrink-0">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-chart-1" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Answered</p>
              <p className="text-lg md:text-2xl font-bold text-foreground">{overallStats.total}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-3 md:p-6 glow-primary transition-glow hover:glow-primary">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 rounded-lg bg-success/20 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Correct</p>
              <p className="text-lg md:text-2xl font-bold text-success">{overallStats.correct}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-3 md:p-6 glow-primary transition-glow hover:glow-primary">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 rounded-lg bg-destructive/20 flex-shrink-0">
              <XCircle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Incorrect</p>
              <p className="text-lg md:text-2xl font-bold text-destructive">{overallStats.incorrect}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-3 md:p-6 glow-accent transition-glow hover:glow-accent">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 rounded-lg bg-accent/20 flex-shrink-0">
              <Target className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Accuracy</p>
              <p className="text-lg md:text-2xl font-bold text-accent">{accuracyPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card variant="glass" className="p-4 md:p-6 glow-primary transition-glow hover:glow-primary">
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2 gradient-text">
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
              <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% Complete</p>
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

        <Card variant="glass" className="p-4 md:p-6 glow-accent transition-glow hover:glow-accent">
          <h2 className="text-lg md:text-xl font-semibold mb-4 gradient-text">Recent Activity (7 Days)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 md:p-4 bg-muted/50 rounded-lg gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-lg md:text-2xl font-bold">{recentActivity.total}</p>
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-muted-foreground">Accuracy</p>
                <p className="text-lg md:text-2xl font-bold text-success">{recentActivity.accuracy}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="text-base md:text-xl font-bold text-success">{recentActivity.correct}</p>
              </div>
              <div className="p-2 md:p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-xs text-muted-foreground">Incorrect</p>
                <p className="text-base md:text-xl font-bold text-destructive">{recentActivity.total - recentActivity.correct}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tests */}
      {recentSessions.length > 0 && (
        <Card variant="glass" className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-semibold">Recent Tests</h2>
          </div>
          <TestHistory 
            sessions={recentSessions} 
            maxItems={5}
            onResume={onResumeTest ? (session) => onResumeTest(session.id) : undefined}
            onDelete={deleteSession}
          />
        </Card>
      )}

      {/* Section Progress */}
      <Card variant="glass" className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6">Total Progress</h2>
        <Accordion type="multiple" className="space-y-3">
          {sectionProgress.map(({ section, totalSectionQuestions, answeredQuestions, percentage, accuracy, subsectionDetails }) => (
            <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-2 md:px-4">
              <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="font-medium text-foreground text-left text-sm md:text-base">{section.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                      <span className="text-muted-foreground">
                        {answeredQuestions} / {totalSectionQuestions}
                      </span>
                      <span className="font-semibold text-primary">{percentage}%</span>
                      {answeredQuestions > 0 && (
                        <span className="text-success">{accuracy}% Accuracy</span>
                      )}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 md:pb-4">
                <div className="space-y-2 md:space-y-3 mt-2">
                  {subsectionDetails.map(({ subsection, totalQuestions, answered, correct, percentage: subPercentage, accuracy: subAccuracy }) => (
                    <div key={subsection.id} className="pl-2 md:pl-4 space-y-2 border-l-2 border-muted">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm font-medium text-foreground truncate">{subsection.title}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 md:gap-3 text-xs">
                          <span className="text-muted-foreground">
                            {answered} / {totalQuestions}
                          </span>
                          <span className="font-semibold text-primary min-w-[35px] text-right">
                            {subPercentage}%
                          </span>
                          {answered > 0 && (
                            <span className="text-success min-w-fit text-right">
                              {correct} Correct
                            </span>
                          )}
                          {answered === 0 && (
                            <span className="text-muted-foreground text-right">
                              Not Started
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress value={subPercentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
