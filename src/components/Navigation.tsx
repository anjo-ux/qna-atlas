import { Section } from '@/types/question';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Pencil } from 'lucide-react';
import { useState } from 'react';
import { EditSubsectionDialog } from './EditSubsectionDialog';

interface NavigationProps {
  sections: Section[];
  activeSection: string;
  activeSubsection: string;
  onNavigate: (sectionId: string, subsectionId: string) => void;
  onSubsectionTitleChange: (sectionId: string, subsectionId: string, newTitle: string) => void;
}

export function Navigation({ 
  sections, 
  activeSection, 
  activeSubsection, 
  onNavigate,
  onSubsectionTitleChange,
}: NavigationProps) {
  const [editingSubsection, setEditingSubsection] = useState<{
    sectionId: string;
    sectionTitle: string;
    subsectionId: string;
    subsectionTitle: string;
  } | null>(null);

  const NavContent = () => (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.subsections.map((subsection) => (
                <div key={subsection.id} className="flex items-center gap-1 group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(section.id, subsection.id)}
                    className={cn(
                      "flex-1 justify-start text-left font-normal transition-smooth",
                      activeSection === section.id && activeSubsection === subsection.id
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate text-xs">{subsection.title}</span>
                    <span className="ml-auto text-xs opacity-60">
                      {subsection.questions.length}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubsection({
                        sectionId: section.id,
                        sectionTitle: section.title,
                        subsectionId: subsection.id,
                        subsectionTitle: subsection.title,
                      });
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-80 border-r border-border bg-card">
        <NavContent />
      </aside>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 elevated-shadow"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      {editingSubsection && (
        <EditSubsectionDialog
          open={!!editingSubsection}
          onOpenChange={(open) => {
            if (!open) setEditingSubsection(null);
          }}
          sectionTitle={editingSubsection.sectionTitle}
          subsectionTitle={editingSubsection.subsectionTitle}
          onSave={(newTitle) => {
            onSubsectionTitleChange(
              editingSubsection.sectionId,
              editingSubsection.subsectionId,
              newTitle
            );
            setEditingSubsection(null);
          }}
        />
      )}
    </>
  );
}
