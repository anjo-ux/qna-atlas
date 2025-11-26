import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { StickyNote } from '@/components/StickyNote';
import { useHighlights } from '@/hooks/useHighlights';
import { useTextHighlight } from '@/hooks/useTextHighlight';

interface ReferenceTextPanelProps {
  content: string;
  subsectionTitle: string;
  sectionId: string;
  subsectionId: string;
  isCompressed?: boolean;
}

export function ReferenceTextPanel({ 
  content, 
  subsectionTitle, 
  sectionId, 
  subsectionId,
  isCompressed = false
}: ReferenceTextPanelProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track container width for responsive compression
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Only compress when container is actually too narrow (< 400px)
  const shouldCompress = containerWidth < 400;
  const {
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    updateNotePosition,
    getHighlightsForSection,
    getNotesForSection,
  } = useHighlights();

  const [highlightedContent, setHighlightedContent] = useState(content);
  const highlights = getHighlightsForSection(sectionId, subsectionId, 'reference');
  const notes = getNotesForSection(sectionId, subsectionId, 'reference');
  const contentRef = useRef<HTMLDivElement>(null);

  // Apply highlights to rendered content
  useTextHighlight(contentRef, highlights, content);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    // Get the full text content to calculate proper offsets
    const container = document.querySelector('[data-reference-content]');
    if (!container) return;

    const fullText = container.textContent || '';
    const selectedIndex = fullText.indexOf(selectedText);
    
    if (selectedIndex === -1) return;

    addHighlight({
      text: selectedText,
      color: activeColor,
      sectionId,
      subsectionId,
      location: 'reference',
      startOffset: selectedIndex,
      endOffset: selectedIndex + selectedText.length,
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
    <div className="h-full flex flex-col relative" ref={containerRef}>
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
          isCompressed={shouldCompress}
        />
      </div>
      <ScrollArea className="flex-1">
        <div 
          ref={contentRef}
          className="p-6 prose prose-sm dark:prose-invert max-w-none"
          data-reference-content
          onMouseUp={handleTextSelection}
          onDoubleClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'MARK') {
              const highlightId = target.getAttribute('data-highlight-id');
              if (highlightId) {
                removeHighlight(highlightId);
              }
            }
          }}
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
          onPositionChange={updateNotePosition}
        />
      ))}
    </div>
  );
}
