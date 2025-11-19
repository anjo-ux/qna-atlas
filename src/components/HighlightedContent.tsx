import { useEffect, useRef } from 'react';
import { Highlight } from '@/hooks/useHighlights';
import { cn } from '@/lib/utils';

interface HighlightedContentProps {
  content: string;
  highlights: Highlight[];
  onRemoveHighlight: (id: string) => void;
  className?: string;
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'bg-highlight-yellow/60',
  green: 'bg-highlight-green/60',
  blue: 'bg-highlight-blue/60',
  pink: 'bg-highlight-pink/60',
};

export function HighlightedContent({
  content,
  highlights,
  onRemoveHighlight,
  className,
}: HighlightedContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const applyHighlights = () => {
      const container = contentRef.current;
      if (!container) return;

      // Remove existing highlights
      const existingMarks = container.querySelectorAll('mark[data-highlight-id]');
      existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
          parent.normalize();
        }
      });

      if (highlights.length === 0) return;

      const textNodes: { node: Text; offset: number }[] = [];
      let currentOffset = 0;

      // Collect all text nodes with their offsets
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          textNodes.push({
            node: node as Text,
            offset: currentOffset,
          });
          currentOffset += node.textContent.length;
        }
      }

      // Apply highlights in reverse order to maintain correct positions
      const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

      sortedHighlights.forEach(highlight => {
        // Find text nodes that contain this highlight
        for (let i = 0; i < textNodes.length; i++) {
          const { node, offset } = textNodes[i];
          const nodeEnd = offset + (node.textContent?.length || 0);

          if (highlight.startOffset < nodeEnd && highlight.endOffset > offset) {
            const startInNode = Math.max(0, highlight.startOffset - offset);
            const endInNode = Math.min(node.textContent?.length || 0, highlight.endOffset - offset);

            if (startInNode < endInNode && node.textContent) {
              const before = node.textContent.substring(0, startInNode);
              const highlighted = node.textContent.substring(startInNode, endInNode);
              const after = node.textContent.substring(endInNode);

              const mark = document.createElement('mark');
              mark.textContent = highlighted;
              mark.className = cn(
                'px-1 rounded cursor-pointer transition-colors',
                HIGHLIGHT_COLORS[highlight.color] || HIGHLIGHT_COLORS.yellow
              );
              mark.setAttribute('data-highlight-id', highlight.id);
              mark.title = 'Double-click to remove highlight';

              const parent = node.parentNode;
              if (parent) {
                if (before) {
                  parent.insertBefore(document.createTextNode(before), node);
                }
                parent.insertBefore(mark, node);
                if (after) {
                  node.textContent = after;
                } else {
                  parent.removeChild(node);
                }
              }
              break;
            }
          }
        }
      });
    };

    // Apply highlights after a small delay to ensure content is rendered
    const timer = setTimeout(applyHighlights, 100);
    return () => clearTimeout(timer);
  }, [highlights, content]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK') {
      const highlightId = target.getAttribute('data-highlight-id');
      if (highlightId) {
        onRemoveHighlight(highlightId);
      }
    }
  };

  return (
    <div
      ref={contentRef}
      className={className}
      onDoubleClick={handleDoubleClick}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
