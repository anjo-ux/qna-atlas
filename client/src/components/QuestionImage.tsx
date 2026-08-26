import { useState } from 'react';
import { cn } from '@/lib/utils';
import { QuestionImageLightbox } from '@/components/QuestionImageLightbox';

type QuestionImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

export function QuestionImage({ src, alt = 'Clinical image', className }: QuestionImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={cn('block w-full text-left', className)}
        aria-label={`View enlarged image: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
        />
      </button>
      <QuestionImageLightbox
        src={src}
        alt={alt}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
