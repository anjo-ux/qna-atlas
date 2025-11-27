import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchResult } from '@/hooks/useGlobalSearch';
import { FileQuestion, BookOpen, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onResultClick: (sectionId: string, subsectionId: string, questionId?: string, noteId?: string) => void;
}

const TYPE_CONFIG = {
  question: {
    icon: FileQuestion,
    label: 'Question',
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  reference: {
    icon: BookOpen,
    label: 'Reference',
    color: 'bg-accent/10 text-accent border-accent/20',
  },
  note: {
    icon: StickyNote,
    label: 'Note',
    color: 'bg-highlight-yellow/30 text-foreground border-highlight-yellow/50',
  },
};

export function SearchResults({ results, query, onResultClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-[9999]">
        <Card className="p-4 shadow-elevated">
          <p className="text-sm text-muted-foreground text-center">
            No results found for "{query}"
          </p>
        </Card>
      </div>
    );
  }

  // Group results by type
  const groupedResults = {
    question: results.filter(r => r.type === 'question'),
    reference: results.filter(r => r.type === 'reference'),
    note: results.filter(r => r.type === 'note'),
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-[9999]">
      <Card className="shadow-elevated overflow-hidden">
        <div className="p-3 border-b border-border bg-accent/5">
          <p className="text-sm font-semibold text-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
        <ScrollArea className="h-[450px]">
          <div className="p-2 space-y-4">
            {Object.entries(groupedResults).map(([type, typeResults]) => {
              if (typeResults.length === 0) return null;
              
              const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
              const Icon = config.icon;

              return (
                <div key={type}>
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {config.label}s ({typeResults.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {typeResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.subsectionId}-${index}`}
                        onClick={() => onResultClick(
                          result.sectionId, 
                          result.subsectionId, 
                          result.questionId, 
                          result.noteId
                        )}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent/5",
                          "focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline" className={cn("text-xs", config.color)}>
                            {result.sectionTitle}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.subsectionTitle}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 line-clamp-2">
                          {highlightMatch(result.matchedText, query)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return (
    <>
      {before}
      <mark className="bg-primary/30 px-0.5 rounded font-semibold">
        {match}
      </mark>
      {after}
    </>
  );
}
