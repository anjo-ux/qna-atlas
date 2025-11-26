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
  isEraserMode = false,
  onEraserToggle,
  disabled = false,
}: HighlightToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-accent/5 border border-border rounded-lg">
      <div className="flex items-center gap-0.5">
        <Highlighter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      </div>
      
      <div className="flex items-center gap-0.5">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            disabled={disabled || isEraserMode}
            className={cn(
              "w-5 h-5 rounded border-2 transition-all hover:scale-110 flex-shrink-0",
              color.class,
              activeColor === color.value && !isEraserMode ? 'border-foreground ring-2 ring-ring' : 'border-border',
              (disabled || isEraserMode) && 'opacity-50 cursor-not-allowed'
            )}
            title={color.label}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onAddNote}
        disabled={disabled}
        className="h-6 w-6 flex-shrink-0"
        title="Add note"
      >
        <StickyNote className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={isEraserMode ? 'default' : 'ghost'}
        size="icon"
        onClick={onEraserToggle}
        disabled={disabled}
        className="h-6 w-6 flex-shrink-0"
        data-testid="button-eraser-toggle"
        title="Eraser mode"
      >
        <Eraser className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearHighlights}
        disabled={disabled}
        className="h-6 w-6 flex-shrink-0"
        title="Clear highlights"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
