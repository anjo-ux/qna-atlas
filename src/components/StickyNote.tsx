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
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(!content);
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      className={cn(
        "absolute w-64 shadow-lg border-2 bg-highlight-yellow/30 backdrop-blur-sm",
        "hover:shadow-xl transition-shadow z-50"
      )}
      style={{ left: position.x, top: position.y }}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground cursor-move">
            <Grip className="h-4 w-4" />
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
