import { useLayoutEffect } from 'react';
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
  /** When this changes (e.g. eraser mode), re-apply marks after React may have reset the DOM. */
  domSyncKey?: unknown
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const existingMarks = container.querySelectorAll('mark[data-highlight-id]');
    existingMarks.forEach((mark) => {
      const text = document.createTextNode(mark.textContent || '');
      mark.parentNode?.replaceChild(text, mark);
    });

    container.normalize();

    if (highlights.length === 0) return;

    const getTextNodes = () => {
      const textNodes: { node: Text; startOffset: number }[] = [];
      let currentOffset = 0;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (
            parent?.tagName === 'SCRIPT' ||
            parent?.tagName === 'STYLE' ||
            parent?.tagName === 'MARK'
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

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

    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    sortedHighlights.forEach((highlight) => {
      const textNodes = getTextNodes();

      for (const { node: textNode, startOffset: nodeStart } of textNodes) {
        if (!container.contains(textNode)) continue;

        const nodeEnd = nodeStart + (textNode.textContent?.length || 0);

        if (highlight.startOffset < nodeEnd && highlight.endOffset > nodeStart) {
          const localStart = Math.max(0, highlight.startOffset - nodeStart);
          const localEnd = Math.min(textNode.textContent?.length || 0, highlight.endOffset - nodeStart);

          if (localStart < localEnd && textNode.textContent) {
            const before = textNode.textContent.substring(0, localStart);
            const highlightedText = textNode.textContent.substring(localStart, localEnd);
            const after = textNode.textContent.substring(localEnd);

            const mark = document.createElement('mark');
            mark.textContent = highlightedText;
            mark.className = `${HIGHLIGHT_COLORS[highlight.color] ?? HIGHLIGHT_COLORS.yellow} highlight-mark cursor-pointer`;
            mark.setAttribute('data-highlight-id', highlight.id);
            mark.title = 'Tap to remove this highlight (eraser mode)';

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
  }, [highlights, content, containerRef, domSyncKey]);
}
