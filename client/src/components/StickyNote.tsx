import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Grip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNoteProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
}

export function StickyNote({
  id,
  content,
  position,
  onUpdate,
  onDelete,
  onPositionChange,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(!content);
  const [localContent, setLocalContent] = useState(content);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  isDraggingRef.current = isDragging;

  useEffect(() => {
    if (isDraggingRef.current) return;
    setCurrentPosition(position);
  }, [position.x, position.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      e.preventDefault();
      setCurrentPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      activePointerIdRef.current = null;
      setCurrentPosition((pos) => {
        onPositionChange?.(id, pos);
        return pos;
      });
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      activePointerIdRef.current = null;
    };
  }, [isDragging, id, onPositionChange]);

  const handleDragHandlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    dragOffsetRef.current = {
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (localContent.trim()) {
      onUpdate(id, localContent);
      setIsEditing(false);
    } else {
      onDelete(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (!content) {
        onDelete(id);
      } else {
        setLocalContent(content);
        setIsEditing(false);
      }
    }
  };

  return (
    <Card
      ref={cardRef}
      data-note-id={id}
      className={cn(
        "absolute w-64 shadow-lg border-2 bg-highlight-yellow/30 backdrop-blur-sm",
        "hover:shadow-xl transition-shadow z-50",
        isDragging && "shadow-2xl opacity-95"
      )}
      style={{ left: `${currentPosition.x}px`, top: `${currentPosition.y}px` }}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div
            className="drag-handle flex touch-none select-none items-center gap-1 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground"
            onPointerDown={handleDragHandlePointerDown}
          >
            <Grip className="h-4 w-4 pointer-events-none" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            className="h-6 w-6 p-0 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add your note..."
              className="min-h-[80px] resize-none text-sm bg-background/50"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="flex-1 h-7 text-xs"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (!content) {
                    onDelete(id);
                  } else {
                    setLocalContent(content);
                    setIsEditing(false);
                  }
                }}
                className="flex-1 h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="text-sm text-foreground/90 cursor-pointer hover:text-foreground whitespace-pre-wrap min-h-[60px] p-2 rounded bg-background/30"
          >
            {content}
          </div>
        )}
      </div>
    </Card>
  );
}
