import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

type QuestionImageLightboxProps = {
  src: string;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuestionImageLightbox({
  src,
  alt,
  open,
  onOpenChange,
}: QuestionImageLightboxProps) {
  const [scale, setScale] = useState(MIN_SCALE);

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetZoom();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[min(96vw,1200px)] w-full h-[min(92vh,900px)] p-0 gap-0 overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2 shrink-0">
          <p className="text-sm text-muted-foreground truncate flex-1">{alt}</p>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={resetZoom}
              disabled={scale <= MIN_SCALE}
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          <div className="min-w-full min-h-full flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className={cn(
                'max-w-none origin-center transition-transform duration-150',
                scale > MIN_SCALE ? 'cursor-grab' : 'cursor-default'
              )}
              style={{ transform: `scale(${scale})` }}
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
