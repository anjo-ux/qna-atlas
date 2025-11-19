import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

interface ReferenceTextPanelProps {
  content: string;
  subsectionTitle: string;
}

export function ReferenceTextPanel({ content, subsectionTitle }: ReferenceTextPanelProps) {
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Select a subsection to view reference material
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4 bg-accent/5">
        <h2 className="text-lg font-semibold text-foreground">Reference Material</h2>
        <p className="text-sm text-muted-foreground mt-1">{subsectionTitle}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 text-primary" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 text-foreground/90" {...props} />,
              li: ({ node, ...props }) => <li className="ml-2" {...props} />,
              p: ({ node, ...props }) => <p className="my-2 text-foreground/90 leading-relaxed" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
