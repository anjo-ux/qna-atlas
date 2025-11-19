import ReactMarkdown from 'react-markdown';

interface SubsectionContentProps {
  content?: string;
}

export function SubsectionContent({ content }: SubsectionContentProps) {
  if (!content) return null;

  return (
    <div className="mb-8 prose prose-sm max-w-none dark:prose-invert">
      <div className="bg-muted/30 rounded-lg p-6 border border-border">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-foreground mt-6 mb-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-foreground mt-4 mb-3">{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 ml-4">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="text-foreground/90 leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            p: ({ children }) => (
              <p className="text-foreground/90 leading-relaxed mb-3">{children}</p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
