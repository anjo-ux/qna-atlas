import { useLocation } from 'wouter';
import { TestMode } from './TestMode';
import { getPreviewQuestions } from '@/utils/previewQuestions';
import { useSections } from '@/hooks/useSections';
import { usePageSeo } from '@/lib/usePageSeo';

export default function PreviewMode() {
  usePageSeo('/preview');
  const { sections, isLoading } = useSections();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-full w-full min-h-0 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading Preview...</p>
        </div>
      </div>
    );
  }

  const previewQuestions = getPreviewQuestions(sections);

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <TestMode 
        sections={sections}
        previewQuestions={previewQuestions}
        onBack={() => navigate('/')}
        isPreview={true}
      />
    </div>
  );
}
