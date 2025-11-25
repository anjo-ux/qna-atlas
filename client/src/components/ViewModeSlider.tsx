import { BookOpen, Columns2, FileQuestion } from 'lucide-react';

type ViewMode = 'reference' | 'split' | 'questions';

interface ViewModeSliderProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  hideLabels?: boolean;
}

const modes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'reference', label: 'Reference', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'split', label: 'Split', icon: <Columns2 className="h-4 w-4" /> },
  { id: 'questions', label: 'Questions', icon: <FileQuestion className="h-4 w-4" /> },
];

export function ViewModeSlider({ value, onChange, hideLabels = false }: ViewModeSliderProps) {
  const selectedIndex = modes.findIndex(m => m.id === value);
  const sliderWidth = 100 / modes.length;
  const sliderOffset = selectedIndex * sliderWidth;

  return (
    <div className="relative inline-flex items-center gap-0 bg-muted/30 rounded-lg p-1 overflow-hidden">
      {/* Animated slider background */}
      <div
        className="absolute top-1 bottom-1 bg-primary/15 rounded-md transition-all duration-300 ease-out"
        style={{
          width: `calc(${sliderWidth}% - 0.5rem)`,
          left: `calc(${sliderOffset}% + 0.25rem)`,
        }}
        aria-hidden="true"
      />

      {/* Buttons */}
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className="relative flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 z-10"
          data-testid={`button-view-${mode.id}`}
        >
          {mode.icon}
          {!hideLabels && <span className="hidden md:inline">{mode.label}</span>}
        </button>
      ))}
    </div>
  );
}
