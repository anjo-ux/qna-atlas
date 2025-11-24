import { useEffect, useRef, useState } from 'react';
import { Highlight, HighlightColor } from '@/hooks/useHighlights';
import { cn } from '@/lib/utils';

interface HighlightableTextProps {
  content: string;
  highlights: Highlight[];
  activeColor: HighlightColor;
  onHighlight: (text: string, startOffset: number, endOffset: number) => void;
  onRemoveHighlight: (id: string) => void;
  className?: string;
  children?: (content: string) => React.ReactNode;
}

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: 'bg-highlight-yellow/50 hover:bg-highlight-yellow/70',
  green: 'bg-highlight-green/50 hover:bg-highlight-green/70',
  blue: 'bg-highlight-blue/50 hover:bg-highlight-blue/70',
  pink: 'bg-highlight-pink/50 hover:bg-highlight-pink/70',
};

export function HighlightableText({
  content,
  highlights,
  activeColor,
  onHighlight,
  onRemoveHighlight,
  className,
  children,
}: HighlightableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      
      const range = selection.getRangeAt(0);
      const container = containerRef.current;
      
      if (!container || !container.contains(range.commonAncestorContainer)) {
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      // Calculate offsets relative to the content
      const preRange = range.cloneRange();
      preRange.selectNodeContents(container);
      preRange.setEnd(range.startContainer, range.startOffset);
      const startOffset = preRange.toString().length;
      const endOffset = startOffset + selectedText.length;

      onHighlight(selectedText, startOffset, endOffset);
      selection.removeAllRanges();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleSelection);
      return () => container.removeEventListener('mouseup', handleSelection);
    }
  }, [onHighlight]);

  const renderHighlightedContent = () => {
    if (highlights.length === 0) {
      return children ? children(content) : content;
    }

    // Sort highlights by start offset
    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add non-highlighted text before this highlight
      if (highlight.startOffset > lastIndex) {
        const text = content.slice(lastIndex, highlight.startOffset);
        parts.push(<span key={`text-${idx}`}>{text}</span>);
      }

      // Add highlighted text
      const highlightedText = content.slice(highlight.startOffset, highlight.endOffset);
      parts.push(
        <mark
          key={highlight.id}
          className={cn(
            'cursor-pointer transition-colors rounded px-0.5',
            HIGHLIGHT_COLORS[highlight.color],
            selectedHighlight === highlight.id && 'ring-2 ring-ring'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedHighlight(highlight.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onRemoveHighlight(highlight.id);
            setSelectedHighlight(null);
          }}
          title="Double-click to remove highlight"
        >
          {highlightedText}
        </mark>
      );

      lastIndex = highlight.endOffset;
    });

    // Add remaining non-highlighted text
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex);
      parts.push(<span key="text-end">{text}</span>);
    }

    return parts;
  };

  return (
    <div ref={containerRef} className={cn('select-text', className)}>
      {children ? (
        <div className="highlightable-wrapper">
          {renderHighlightedContent()}
        </div>
      ) : (
        renderHighlightedContent()
      )}
    </div>
  );
}
