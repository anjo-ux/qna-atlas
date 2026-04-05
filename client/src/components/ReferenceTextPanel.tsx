import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
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
    highlights,
  } = useHighlights();

  const [isEraserMode, setIsEraserMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const referenceContentFingerprint = useMemo(
    () => sections.map((s) => `${s.sectionId}\0${s.subsectionId}\0${s.content}`).join('\f'),
    [sections]
  );

  const panelReferenceHighlights = useMemo(
    () =>
      highlights.filter(
        (h) =>
          h.location === 'reference' &&
          sections.some(
            (s) => s.sectionId === h.sectionId && s.subsectionId === h.subsectionId
          )
      ),
    [highlights, sections]
  );

  useTextHighlight(contentRef, panelReferenceHighlights, referenceContentFingerprint, isEraserMode);

  // Scroll to selected section when it changes
  useEffect(() => {
    if (!selectedSectionId || !selectedSubsectionId) return;
    
    setTimeout(() => {
      const element = document.querySelector(
        `[data-section-id="${selectedSectionId}"][data-subsection-id="${selectedSubsectionId}"]`
      );
      
      if (element) {
        // Find the closest scrollable parent
        let scrollParent = element.parentElement;
        while (scrollParent) {
          if (scrollParent.scrollHeight > scrollParent.clientHeight) {
            // Found a scrollable parent
            const elementOffsetTop = (element as HTMLElement).offsetTop;
            const scrollParentTop = (scrollParent as HTMLElement).offsetTop;
            const relativeTop = elementOffsetTop - scrollParentTop;
            
            scrollParent.scrollTo({
              top: relativeTop,
              behavior: 'smooth'
            });
            break;
          }
          scrollParent = scrollParent.parentElement;
        }
      }
    }, 50);
  }, [selectedSectionId, selectedSubsectionId]);

  useLayoutEffect(() => {
    if (!isEraserMode) return;
    const root = contentRef.current;
    if (!root) return;

    const onPointerUpCapture = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target || !root.contains(target)) return;
      const mark = target.closest('mark[data-highlight-id]');
      if (!mark || !root.contains(mark)) return;
      e.preventDefault();
      e.stopPropagation();
      const highlightId = mark.getAttribute('data-highlight-id');
      if (highlightId) removeHighlight(highlightId);
    };

    root.addEventListener('pointerup', onPointerUpCapture, true);
    return () => root.removeEventListener('pointerup', onPointerUpCapture, true);
  }, [isEraserMode, removeHighlight]);

  const flushTextHighlightSelection = useCallback(() => {
    if (isEraserMode) {
      window.getSelection()?.removeAllRanges();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const container = contentRef.current;
    if (!container) return;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;

    const raw = selection.toString();
    if (raw.trim().length < 2) return;

    const sectionDiv = (selection.anchorNode as Node)?.parentElement?.closest(
      '[data-section-id]'
    ) as HTMLElement | null;
    if (!sectionDiv || !container.contains(sectionDiv)) return;

    const sectionId = sectionDiv.getAttribute('data-section-id');
    const subsectionId = sectionDiv.getAttribute('data-subsection-id');
    if (!sectionId || !subsectionId) return;

    const pre = document.createRange();
    pre.selectNodeContents(container);
    pre.setEnd(range.startContainer, range.startOffset);
    const startOffset = pre.toString().length;
    const endOffset = startOffset + raw.length;

    addHighlight({
      text: raw.trim(),
      color: activeColor,
      sectionId,
      subsectionId,
      location: 'reference',
      startOffset,
      endOffset,
    });

    selection.removeAllRanges();
  }, [isEraserMode, addHighlight, activeColor]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      requestAnimationFrame(() => flushTextHighlightSelection());
    },
    [flushTextHighlightSelection]
  );

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
          <p className="text-sm text-muted-foreground mt-1">Default Text</p>
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
          className={cn("p-6 prose prose-sm dark:prose-invert max-w-none touch-manipulation", isEraserMode && "eraser-mode")}
          data-reference-content
          onPointerUp={handlePointerUp}
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
                  skipHtml
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
        </div>
      </ScrollArea>
    </div>
  );
}
