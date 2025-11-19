import { Highlighter, StickyNote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HighlightToolbarProps {
  onColorSelect: (color: string) => void;
  onAddNote?: () => void;
  onClose: () => void;
  position: { x: number; y: number };
  showNoteButton?: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'Green', value: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Blue', value: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Pink', value: '#fbcfe8', class: 'bg-pink-200' },
  { name: 'Purple', value: '#e9d5ff', class: 'bg-purple-200' },
];

export function HighlightToolbar({ 
  onColorSelect, 
  onAddNote,
  onClose, 
  position,
  showNoteButton = false,
}: HighlightToolbarProps) {
  return (
    <div
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-100%) translateY(-8px)',
      }}
    >
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <Highlighter className="h-4 w-4 text-muted-foreground" />
        {HIGHLIGHT_COLORS.map((color) => (
          <Button
            key={color.value}
            size="sm"
            variant="ghost"
            className={cn(
              'w-8 h-8 p-0 rounded hover:ring-2 hover:ring-primary/50',
              color.class
            )}
            onClick={() => {
              onColorSelect(color.value);
              onClose();
            }}
            title={`Highlight ${color.name}`}
          />
        ))}
      </div>
      
      {showNoteButton && onAddNote && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onAddNote();
            onClose();
          }}
          className="h-8"
          title="Add sticky note"
        >
          <StickyNote className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
