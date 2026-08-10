import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { TestMode } from './TestMode';
import { buildSectionsFromQuestions } from '@/utils/previewQuestions';
import { usePageSeo } from '@/lib/usePageSeo';
import { useHostSpecialty } from '@/hooks/useSpecialty';
import type { Question } from '@/types/question';

/**
 * Public 20-question preview. Always loads the **host** specialty sample so
 * ortho-atlas.com/preview never serves Plastic Surgery items (even if a logged-in
 * user still has PRS as their active q-bank).
 *
 * Only the capped preview set is fetched — never the full bank.
 */
export default function PreviewMode() {
  usePageSeo('/preview');
  const hostSpecialty = useHostSpecialty();
  const [, navigate] = useLocation();

  const { data: previewQuestions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/preview/questions', hostSpecialty.id],
    queryFn: async () => {
      const res = await fetch(`/api/preview/questions?specialtyId=${hostSpecialty.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch preview questions');
      return res.json();
    },
    staleTime: 60_000,
  });

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

  const sections = buildSectionsFromQuestions(previewQuestions);

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
