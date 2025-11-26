import { Button } from '@/components/ui/button';
import { Highlighter, StickyNote, Trash2, Eraser } from 'lucide-react';
import { HighlightColor } from '@/hooks/useHighlights';
import { cn } from '@/lib/utils';

interface HighlightToolbarProps {
  activeColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  onAddNote: () => void;
  onClearHighlights: () => void;
  isEraserMode?: boolean;
  onEraserToggle?: () => void;
  disabled?: boolean;
}

const COLORS: { value: HighlightColor; label: string; class: string }[] = [
  { value: 'yellow', label: 'Yellow', class: 'bg-highlight-yellow' },
  { value: 'green', label: 'Green', class: 'bg-highlight-green' },
  { value: 'blue', label: 'Blue', class: 'bg-highlight-blue' },
  { value: 'pink', label: 'Pink', class: 'bg-highlight-pink' },
];

export function HighlightToolbar({
  activeColor,
  onColorChange,
  onAddNote,
  onClearHighlights,
  disabled = false,
}: HighlightToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-accent/5 border border-border rounded-lg">
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <Highlighter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground hidden sm:inline">Highlight:</span>
      </div>
      
      <div className="flex items-center gap-1">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            disabled={disabled}
            className={cn(
              "w-6 h-6 rounded border-2 transition-all hover:scale-110",
              color.class,
              activeColor === color.value ? 'border-foreground ring-2 ring-ring' : 'border-border',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={color.label}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 pl-2 border-l border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddNote}
          disabled={disabled}
          className="gap-2 h-8"
        >
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Note</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHighlights}
          disabled={disabled}
          className="gap-2 h-8"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  );
}
