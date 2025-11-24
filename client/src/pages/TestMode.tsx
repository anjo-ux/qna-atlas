import { useState, useMemo } from 'react';
import { Section, Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuestionCard } from '@/components/QuestionCard';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useQuestionStats } from '@/hooks/useQuestionStats';

interface TestModeProps {
  sections: Section[];
  onBack: () => void;
}

type TestState = 'setup' | 'testing' | 'results';

export function TestMode({ sections, onBack }: TestModeProps) {
  const [testState, setTestState] = useState<TestState>('setup');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 40>(10);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { answer: string; correct: boolean }>>({});

  const { recordResponse } = useQuestionStats();

  // Get all available questions based on selection
  const availableQuestions = useMemo(() => {
    let questions: Question[] = [];
    
    if (useAllQuestions) {
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          questions.push(...subsection.questions);
        });
      });
    } else {
      sections.forEach(section => {
        if (selectedSections.has(section.id)) {
          section.subsections.forEach(subsection => {
            questions.push(...subsection.questions);
          });
        }
      });
    }
    
    return questions;
  }, [sections, selectedSections, useAllQuestions]);

  const handleStartTest = () => {
    if (availableQuestions.length === 0) {
      return;
    }

    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setTestState('testing');
  };

  const handleToggleSection = (sectionId: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  const handleAnswerSubmit = (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    setResponses(prev => ({
      ...prev,
      [questionId]: { answer: selectedAnswer, correct: isCorrect }
    }));

    // Find the section and subsection for recording
    for (const section of sections) {
      for (const subsection of section.subsections) {
        if (subsection.questions.some(q => q.id === questionId)) {
          recordResponse({
            questionId,
            sectionId: section.id,
            subsectionId: subsection.id,
            selectedAnswer,
            correctAnswer,
            isCorrect,
          });
          break;
        }
      }
    }

    // Move to next question or finish
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestState('results');
    }
  };

  const testResults = useMemo(() => {
    const total = Object.keys(responses).length;
    const correct = Object.values(responses).filter(r => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }, [responses]);

  if (testState === 'setup') {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Create Test</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question Count */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Number of Questions</h2>
              <RadioGroup value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v) as any)}>
                <div className="space-y-3">
                  {[10, 20, 30, 40].map(count => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count.toString()} id={`count-${count}`} />
                      <Label htmlFor={`count-${count}`} className="cursor-pointer">{count} Questions</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>

            {/* Question Source */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Questions From</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5"
                  onClick={() => setUseAllQuestions(!useAllQuestions)}>
                  <Checkbox 
                    checked={useAllQuestions}
                    onCheckedChange={(checked) => setUseAllQuestions(!!checked)}
                    id="all-questions"
                  />
                  <Label htmlFor="all-questions" className="cursor-pointer flex-1">
                    <div className="font-medium">All Available Questions</div>
                    <div className="text-sm text-muted-foreground">Randomly select from all {availableQuestions.length} questions</div>
                  </Label>
                </div>

                {!useAllQuestions && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <Label className="text-base font-medium">Sections to Include:</Label>
                    {sections.map(section => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedSections.has(section.id)}
                          onCheckedChange={() => handleToggleSection(section.id)}
                          id={`section-${section.id}`}
                        />
                        <Label htmlFor={`section-${section.id}`} className="cursor-pointer">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {section.subsections.reduce((acc, s) => acc + s.questions.length, 0)} questions
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStartTest}
              disabled={!useAllQuestions && selectedSections.size === 0}
              className="w-full"
            >
              Start Test ({Math.min(questionCount, availableQuestions.length)} questions)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'testing') {
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-4 border-b border-border bg-accent/5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">Test Mode</h1>
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {testQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round((currentQuestionIndex / testQuestions.length) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              sectionId=""
              subsectionId=""
              onAnswerSubmit={handleAnswerSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTestState('setup')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl font-bold text-primary">{testResults.accuracy}%</div>
                <div className="text-2xl font-semibold text-foreground">
                  {testResults.correct} out of {testResults.total} Correct
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Questions</p>
                <p className="text-3xl font-bold">{testResults.total}</p>
              </Card>
              <Card className="p-6 text-center bg-success/10 border-success/20">
                <p className="text-sm text-muted-foreground mb-2">Correct</p>
                <p className="text-3xl font-bold text-success">{testResults.correct}</p>
              </Card>
              <Card className="p-6 text-center bg-destructive/10 border-destructive/20">
                <p className="text-sm text-muted-foreground mb-2">Incorrect</p>
                <p className="text-3xl font-bold text-destructive">{testResults.total - testResults.correct}</p>
              </Card>
            </div>

            <Button onClick={() => setTestState('setup')} className="w-full">
              Create Another Test
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to Study
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
