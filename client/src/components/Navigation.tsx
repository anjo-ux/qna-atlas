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
            <h3 className="font-semibold text-sm text-foreground mb-3 px-2">
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
                    "w-full justify-start text-left font-normal transition-smooth relative overflow-hidden",
                    selectedSection === section.id && selectedSubsection === subsection.id
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10"
                  )}
                >
                  <span className="truncate text-xs relative z-10">{subsection.title}</span>
                  <span className="ml-auto text-xs opacity-80 relative z-10">
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
      <aside className="w-full h-full border-r border-border bg-gradient-to-b from-card via-card to-muted/30 flex flex-col shadow-lg">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Sections</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Subsections
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="lg:hidden flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavContent />
      </aside>
  );
}
