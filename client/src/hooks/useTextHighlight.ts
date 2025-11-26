import { useEffect, useRef } from 'react';
import { Highlight } from './useHighlights';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'bg-highlight-yellow/60',
  green: 'bg-highlight-green/60',
  blue: 'bg-highlight-blue/60',
  pink: 'bg-highlight-pink/60',
};

export function useTextHighlight(
  containerRef: React.RefObject<HTMLElement>,
  highlights: Highlight[],
  content: string,
  isEraserMode: boolean = false,
  onRemoveHighlight?: (id: string) => void
) {
  const previousHighlights = useRef<string>('');
  const removeHighlightRef = useRef(onRemoveHighlight);

  useEffect(() => {
    removeHighlightRef.current = onRemoveHighlight;
  }, [onRemoveHighlight]);

  useEffect(() => {
    const highlightsKey = JSON.stringify(highlights.map(h => h.id));
    if (previousHighlights.current === highlightsKey) return;
    previousHighlights.current = highlightsKey;

    const container = containerRef.current;
    if (!container) return;

    // Remove all existing highlight marks
    const existingMarks = container.querySelectorAll('mark[data-highlight-id]');
    existingMarks.forEach(mark => {
      const text = document.createTextNode(mark.textContent || '');
      mark.parentNode?.replaceChild(text, mark);
    });

    // Normalize text nodes
    container.normalize();

    if (highlights.length === 0) return;

    // Helper function to get fresh text nodes each time we need them
    const getTextNodes = () => {
      const textNodes: { node: Text; startOffset: number }[] = [];
      let currentOffset = 0;

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip text inside script, style, or existing mark tags
            const parent = node.parentElement;
            if (parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE' || parent?.tagName === 'MARK') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        if (textNode.textContent) {
          textNodes.push({
            node: textNode,
            startOffset: currentOffset,
          });
          currentOffset += textNode.textContent.length;
        }
      }
      return textNodes;
    };

    // Apply highlights in reverse order to maintain correct offsets
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    sortedHighlights.forEach(highlight => {
      // Get fresh text nodes for each highlight to ensure we're working with current DOM state
      const textNodes = getTextNodes();
      
      // Find the text node(s) containing this highlight
      for (const { node: textNode, startOffset: nodeStart } of textNodes) {
        // Check if node is still in the DOM
        if (!container.contains(textNode)) continue;
        
        const nodeEnd = nodeStart + (textNode.textContent?.length || 0);

        // Check if this highlight overlaps with this text node
        if (highlight.startOffset < nodeEnd && highlight.endOffset > nodeStart) {
          const localStart = Math.max(0, highlight.startOffset - nodeStart);
          const localEnd = Math.min(textNode.textContent?.length || 0, highlight.endOffset - nodeStart);

          if (localStart < localEnd && textNode.textContent) {
            const before = textNode.textContent.substring(0, localStart);
            const highlightedText = textNode.textContent.substring(localStart, localEnd);
            const after = textNode.textContent.substring(localEnd);

            const mark = document.createElement('mark');
            mark.textContent = highlightedText;
            const cursorClass = isEraserMode ? 'cursor-inherit' : 'cursor-pointer';
            mark.className = `${HIGHLIGHT_COLORS[highlight.color]} px-1 rounded ${cursorClass} transition-all hover:opacity-80`;
            mark.setAttribute('data-highlight-id', highlight.id);
            mark.title = isEraserMode ? 'Click to delete' : 'Double-click to remove';
            mark.style.pointerEvents = 'auto';

            const parent = textNode.parentNode;
            if (!parent) continue;

            const fragment = document.createDocumentFragment();
            if (before) fragment.appendChild(document.createTextNode(before));
            fragment.appendChild(mark);
            if (after) fragment.appendChild(document.createTextNode(after));

            parent.replaceChild(fragment, textNode);
            break;
          }
        }
      }
    });

    // Add event delegation for eraser mode using mousedown (more reliable than click)
    const handleMouseDown = (e: MouseEvent) => {
      if (!isEraserMode) return;
      
      const target = e.target as HTMLElement;
      const mark = target.closest('mark[data-highlight-id]');
      
      if (mark) {
        e.preventDefault();
        e.stopPropagation();
        const highlightId = mark.getAttribute('data-highlight-id');
        if (highlightId && removeHighlightRef.current) {
          removeHighlightRef.current(highlightId);
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [highlights, content, containerRef, isEraserMode]);
}
