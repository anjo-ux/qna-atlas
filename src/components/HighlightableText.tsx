import { useState, useRef, useEffect } from 'react';
import { useAnnotations, Highlight } from '@/contexts/AnnotationContext';
import { HighlightToolbar } from './HighlightToolbar';

interface HighlightableTextProps {
  content: string;
  sectionId: string;
  subsectionId: string;
  containerType: 'reference' | 'question';
  questionId?: string;
  children: (highlightedContent: JSX.Element) => JSX.Element;
  showNoteButton?: boolean;
  onAddNote?: (position: { x: number; y: number }) => void;
}

export function HighlightableText({
  content,
  sectionId,
  subsectionId,
  containerType,
  questionId,
  children,
  showNoteButton = false,
  onAddNote,
}: HighlightableTextProps) {
  const { addHighlight, getHighlightsForContent } = useAnnotations();
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const highlights = getHighlightsForContent(sectionId, subsectionId, containerType, questionId);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) return;

    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const selectedText = sel.toString().trim();
    if (!selectedText) return;

    // Calculate the offset in the full content
    const textContent = containerRef.current.textContent || '';
    const beforeText = range.startContainer.textContent?.substring(0, range.startOffset) || '';
    let startOffset = 0;
    
    // Find the start offset by traversing text nodes
    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentNode;
    let currentOffset = 0;
    let found = false;
    
    while ((currentNode = walker.nextNode())) {
      if (currentNode === range.startContainer) {
        startOffset = currentOffset + range.startOffset;
        found = true;
        break;
      }
      currentOffset += currentNode.textContent?.length || 0;
    }

    if (!found) return;

    const endOffset = startOffset + selectedText.length;

    setSelection({
      text: selectedText,
      startOffset,
      endOffset,
    });

    // Position the toolbar
    const rect = range.getBoundingClientRect();
    setToolbarPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
    });
    setShowToolbar(true);
  };

  const handleColorSelect = (color: string) => {
    if (!selection) return;

    addHighlight({
      sectionId,
      subsectionId,
      text: selection.text,
      color,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      containerType,
      questionId,
    });

    setShowToolbar(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNoteClick = () => {
    if (onAddNote && toolbarPosition) {
      onAddNote(toolbarPosition);
    }
  };

  // Apply highlights to content
  const applyHighlights = (text: string, highlights: Highlight[]): JSX.Element[] => {
    if (highlights.length === 0) {
      return [<span key="0">{text}</span>];
    }

    // Sort highlights by start offset
    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
    
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.startOffset > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlight.startOffset)}
          </span>
        );
      }

      // Add highlighted text
      elements.push(
        <mark
          key={`highlight-${idx}`}
          style={{ backgroundColor: highlight.color }}
          className="px-0.5 rounded"
        >
          {text.substring(highlight.startOffset, highlight.endOffset)}
        </mark>
      );

      lastIndex = highlight.endOffset;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  const highlightedContent = (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="select-text"
    >
      {applyHighlights(content, highlights)}
    </div>
  );

  return (
    <>
      {children(highlightedContent)}
      
      {showToolbar && (
        <HighlightToolbar
          position={toolbarPosition}
          onColorSelect={handleColorSelect}
          onAddNote={showNoteButton ? handleAddNoteClick : undefined}
          onClose={() => {
            setShowToolbar(false);
            setSelection(null);
            window.getSelection()?.removeAllRanges();
          }}
          showNoteButton={showNoteButton}
        />
      )}
    </>
  );
}
