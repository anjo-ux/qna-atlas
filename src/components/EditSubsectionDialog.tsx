import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditSubsectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionTitle: string;
  subsectionTitle: string;
  onSave: (newTitle: string) => void;
}

export function EditSubsectionDialog({
  open,
  onOpenChange,
  sectionTitle,
  subsectionTitle,
  onSave,
}: EditSubsectionDialogProps) {
  const [title, setTitle] = useState(subsectionTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subsection Title</DialogTitle>
          <DialogDescription>
            Change the display name for this subsection in {sectionTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Subsection Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
