import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { StickyNote } from '@/components/StickyNote';
import { useHighlights } from '@/hooks/useHighlights';

interface ReferenceTextPanelProps {
  content: string;
  subsectionTitle: string;
  sectionId: string;
  subsectionId: string;
}

export function ReferenceTextPanel({ 
  content, 
  subsectionTitle, 
  sectionId, 
  subsectionId 
}: ReferenceTextPanelProps) {
  const {
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    getHighlightsForSection,
    getNotesForSection,
  } = useHighlights();

  const [highlightedContent, setHighlightedContent] = useState(content);
  const highlights = getHighlightsForSection(sectionId, subsectionId, 'reference');
  const notes = getNotesForSection(sectionId, subsectionId, 'reference');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = startOffset + selectedText.length;

    addHighlight({
      text: selectedText,
      color: activeColor,
      sectionId,
      subsectionId,
      location: 'reference',
      startOffset,
      endOffset,
    });

    selection.removeAllRanges();
  };

  const handleAddNote = () => {
    addNote({
      content: '',
      sectionId,
      subsectionId,
      location: 'reference',
      position: { x: 100, y: 100 },
    });
  };

  const handleClearHighlights = () => {
    highlights.forEach(h => removeHighlight(h.id));
  };

  const renderHighlightedMarkdown = (text: string) => {
    let result = text;
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    sortedHighlights.forEach(highlight => {
      const before = result.slice(0, highlight.startOffset);
      const highlighted = result.slice(highlight.startOffset, highlight.endOffset);
      const after = result.slice(highlight.endOffset);
      
      result = `${before}<mark class="bg-highlight-${highlight.color}/50 px-0.5 rounded cursor-pointer" data-highlight-id="${highlight.id}">${highlighted}</mark>${after}`;
    });

    return result;
  };

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
    <div className="h-full flex flex-col relative">
      <div className="border-b border-border p-4 bg-accent/5 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reference Material</h2>
          <p className="text-sm text-muted-foreground mt-1">{subsectionTitle}</p>
        </div>
        <HighlightToolbar
          activeColor={activeColor}
          onColorChange={setActiveColor}
          onAddNote={handleAddNote}
          onClearHighlights={handleClearHighlights}
        />
      </div>
      <ScrollArea className="flex-1">
        <div 
          className="p-6 prose prose-sm dark:prose-invert max-w-none"
          onMouseUp={handleTextSelection}
        >
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
      
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          content={note.content}
          position={note.position}
          onUpdate={updateNote}
          onDelete={removeNote}
        />
      ))}
    </div>
  );
}
