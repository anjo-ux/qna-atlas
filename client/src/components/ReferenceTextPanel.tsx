import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { StickyNote } from '@/components/StickyNote';
import { useHighlights } from '@/hooks/useHighlights';
import { useTextHighlight } from '@/hooks/useTextHighlight';
import { cn } from '@/lib/utils';

interface ReferenceSection {
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  content: string;
}

interface ReferenceTextPanelProps {
  sections: ReferenceSection[];
  selectedSectionId?: string;
  selectedSubsectionId?: string;
  isCompressed?: boolean;
}

export function ReferenceTextPanel({ 
  sections, 
  selectedSectionId,
  selectedSubsectionId,
  isCompressed = false
}: ReferenceTextPanelProps) {
  const {
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    batchRemoveHighlights,
    addNote,
    updateNote,
    removeNote,
    updateNotePosition,
    getHighlightsForSection,
    getNotesForSection,
  } = useHighlights();

  const [isEraserMode, setIsEraserMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to selected section when it changes
  useEffect(() => {
    if (!selectedSectionId || !selectedSubsectionId) return;
    
    setTimeout(() => {
      const element = document.querySelector(
        `[data-section-id="${selectedSectionId}"][data-subsection-id="${selectedSubsectionId}"]`
      );
      if (element && scrollAreaRef.current) {
        // Use the scrollAreaRef directly to find the viewport
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (viewport) {
          // Get element's bounding rect relative to viewport
          const elementRect = element.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();
          
          // Calculate the element's position relative to the viewport's scroll content
          const elementTopRelativeToContent = element.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
          
          viewport.scrollTo({
            top: elementTopRelativeToContent,
            behavior: 'smooth'
          });
        }
      }
    }, 50);
  }, [selectedSectionId, selectedSubsectionId]);

  // Setup global eraser click handler
  useEffect(() => {
    if (!isEraserMode) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.hasAttribute('data-highlight-id')) {
        e.preventDefault();
        e.stopPropagation();
        const highlightId = target.getAttribute('data-highlight-id');
        if (highlightId) {
          removeHighlight(highlightId);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isEraserMode, removeHighlight]);

  const handleTextSelection = () => {
    // Don't allow highlighting when in eraser mode
    if (isEraserMode) {
      window.getSelection()?.removeAllRanges();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    // Get section from the closest section div
    const sectionDiv = (selection.anchorNode as Node)?.parentElement?.closest('[data-section-id]') as HTMLElement;
    if (!sectionDiv) return;

    const sectionId = sectionDiv.getAttribute('data-section-id');
    const subsectionId = sectionDiv.getAttribute('data-subsection-id');
    if (!sectionId || !subsectionId) return;

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
    if (!selectedSectionId || !selectedSubsectionId) return;
    addNote({
      content: '',
      sectionId: selectedSectionId,
      subsectionId: selectedSubsectionId,
      location: 'reference',
      position: { x: 100, y: 100 },
    });
  };

  const handleClearHighlights = () => {
    if (!selectedSectionId || !selectedSubsectionId) return;
    const highlights = getHighlightsForSection(selectedSectionId, selectedSubsectionId, 'reference');
    batchRemoveHighlights(highlights.map(h => h.id));
  };

  if (!sections || sections.length === 0) {
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
          <p className="text-sm text-muted-foreground mt-1">Entire Database (Scrollable)</p>
        </div>
        <HighlightToolbar
          activeColor={activeColor}
          onColorChange={setActiveColor}
          onAddNote={handleAddNote}
          onClearHighlights={handleClearHighlights}
          isEraserMode={isEraserMode}
          onEraserToggle={() => setIsEraserMode(!isEraserMode)}
          isCompressed={isCompressed}
        />
      </div>
      <ScrollArea className="flex-1">
        <div ref={scrollAreaRef} className="h-full">
        <div 
          ref={contentRef}
          className={cn("p-6 prose prose-sm dark:prose-invert max-w-none", isEraserMode && "eraser-mode")}
          data-reference-content
          onMouseUp={handleTextSelection}
        >
          {sections.map((section) => {
            const sectionHighlights = getHighlightsForSection(section.sectionId, section.subsectionId, 'reference');
            const sectionNotes = getNotesForSection(section.sectionId, section.subsectionId, 'reference');
            
            return (
              <div 
                key={`${section.sectionId}-${section.subsectionId}`}
                data-section-id={section.sectionId}
                data-subsection-id={section.subsectionId}
                className="mb-8 pb-6 border-b border-border/50 last:border-b-0"
              >
                <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground uppercase">
                  {section.subsectionTitle}
                </h2>
                <p className="text-xs text-muted-foreground mb-4">{section.sectionTitle}</p>
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 text-primary" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground uppercase" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 text-foreground/90" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                    p: ({ node, ...props }) => <p className="my-2 text-foreground/90 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
