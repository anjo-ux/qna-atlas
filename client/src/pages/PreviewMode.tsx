import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Section } from '@/types/question';
import { TestMode } from './TestMode';
import { getPreviewQuestions } from '@/utils/previewQuestions';
import { loadQuestions } from '@/utils/parseQuestions';

export default function PreviewMode() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const questionsData = await loadQuestions();
        setSections(questionsData);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading preview test...</p>
        </div>
      </div>
    );
  }

  const previewQuestions = getPreviewQuestions(sections);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TestMode 
        sections={sections}
        previewQuestions={previewQuestions}
        onBack={() => navigate('/')}
        isPreview={true}
      />
    </div>
  );
}
