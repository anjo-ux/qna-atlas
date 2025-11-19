import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useAnnotations } from '@/contexts/AnnotationContext';
import { HighlightableText } from './HighlightableText';
import { StickyNoteComponent } from './StickyNoteComponent';

interface ReferenceTextPanelProps {
  content: string;
  subsectionTitle: string;
  sectionId: string;
  subsectionId: string;
}

export function ReferenceTextPanel({ content, subsectionTitle, sectionId, subsectionId }: ReferenceTextPanelProps) {
  const { addNote, getNotesForContent, updateNote, removeNote } = useAnnotations();
  const notes = getNotesForContent(sectionId, subsectionId);
  const [notePositions, setNotePositions] = useState<Record<string, { x: number; y: number }>>({});

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Select a subsection to view reference material
        </p>
      </div>
    );
  }

  const handleAddNote = (position: { x: number; y: number }) => {
    addNote({
      sectionId,
      subsectionId,
      text: '',
      color: '#fef08a',
      position,
      containerType: 'reference',
    });
  };

  const handleNotePositionChange = (noteId: string, position: { x: number; y: number }) => {
    setNotePositions(prev => ({ ...prev, [noteId]: position }));
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="border-b border-border p-4 bg-accent/5">
        <h2 className="text-lg font-semibold text-foreground">Reference Material</h2>
        <p className="text-sm text-muted-foreground mt-1">{subsectionTitle}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <HighlightableText
            content={content}
            sectionId={sectionId}
            subsectionId={subsectionId}
            containerType="reference"
            showNoteButton={true}
            onAddNote={handleAddNote}
          >
            {(highlightedContent) => (
              <ReactMarkdown
                components={{
                  h1: ({ node, children, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 text-primary" {...props}>{children}</h1>,
                  h2: ({ node, children, ...props }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground" {...props}>{children}</h2>,
                  h3: ({ node, children, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props}>{children}</h3>,
                  ul: ({ node, children, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 text-foreground/90" {...props}>{children}</ul>,
                  li: ({ node, children, ...props }) => <li className="ml-2" {...props}>{children}</li>,
                  p: ({ node, children, ...props }) => <p className="my-2 text-foreground/90 leading-relaxed" {...props}>{children}</p>,
                  strong: ({ node, children, ...props }) => <strong className="font-semibold text-foreground" {...props}>{children}</strong>,
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </HighlightableText>
        </div>
      </ScrollArea>

      {notes.map((note) => (
        <StickyNoteComponent
          key={note.id}
          id={note.id}
          text={note.text}
          color={note.color}
          position={notePositions[note.id] || note.position}
          onUpdate={(text) => updateNote(note.id, text)}
          onRemove={() => removeNote(note.id)}
          onPositionChange={(pos) => handleNotePositionChange(note.id, pos)}
        />
      ))}
    </div>
  );
}
