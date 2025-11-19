import { Section } from '@/types/question';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface NavigationProps {
  sections: Section[];
  selectedSection: string | null;
  selectedSubsection: string | null;
  onNavigate: (sectionId: string, subsectionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Navigation({ 
  sections, 
  selectedSection, 
  selectedSubsection, 
  onNavigate, 
  isOpen, 
  onClose 
}: NavigationProps) {
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
                <Button
                  key={subsection.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(section.id, subsection.id)}
                  className={cn(
                    "w-full justify-start text-left font-normal transition-smooth",
                    selectedSection === section.id && selectedSubsection === subsection.id
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="truncate text-xs">{subsection.title}</span>
                  <span className="ml-auto text-xs opacity-60">
                    {subsection.questions.length}
                  </span>
                </Button>
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
      <aside className="hidden lg:flex w-80 border-r border-border bg-card flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Sections</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sections.reduce((acc, s) => acc + s.subsections.length, 0)} subsections
          </p>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Navigation */}
      {isOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-80 border-r border-border bg-card z-50 flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sections</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {sections.reduce((acc, s) => acc + s.subsections.length, 0)} subsections
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
