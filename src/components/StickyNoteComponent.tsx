import { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface StickyNoteComponentProps {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  onUpdate: (text: string) => void;
  onRemove: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function StickyNoteComponent({
  id,
  text,
  color,
  position,
  onUpdate,
  onRemove,
  onPositionChange,
}: StickyNoteComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [isEditing, text.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('textarea, button')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      onPositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  return (
    <div
      ref={noteRef}
      className={cn(
        'fixed w-64 rounded-lg shadow-lg border-2 transition-shadow',
        isDragging && 'cursor-grabbing shadow-2xl',
        !isDragging && 'cursor-grab'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: color,
        borderColor: color,
        zIndex: isDragging ? 1000 : 100,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-2 border-b border-black/10">
        <GripVertical className="h-4 w-4 text-foreground/40" />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-black/10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="p-3">
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onUpdate(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="min-h-[100px] bg-transparent border-none resize-none focus-visible:ring-0 text-sm"
            placeholder="Type your note..."
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            className="min-h-[100px] text-sm whitespace-pre-wrap cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {text || 'Click to edit...'}
          </p>
        )}
      </div>
    </div>
  );
}
