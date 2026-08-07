import { Check, ChevronsUpDown, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpecialty } from "@/hooks/useSpecialty";
import { cn } from "@/lib/utils";

/**
 * Switches the active question bank. Locked banks stay selectable on purpose: choosing one lands
 * on its themed subscribe page, and switching back is always available.
 */
export function SpecialtySwitcher({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost";
}) {
  const { activeSpecialty, available, lockedBySpecialty, isSwitching, switchSpecialty } =
    useSpecialty();

  if (available.length < 2) return null;

  const active = available.find((s) => s.id === activeSpecialty) ?? available[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={isSwitching}
          className={cn("gap-2", className)}
          data-testid="button-specialty-switcher"
          title="Switch question bank"
        >
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="truncate">{active.shortName}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Question Bank</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((option) => {
          const isActive = option.id === activeSpecialty;
          const isLocked = lockedBySpecialty[option.id] === true;
          return (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => switchSpecialty(option.id)}
              className="gap-2"
              data-testid={`menuitem-specialty-${option.id}`}
            >
              <Check className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-0")} />
              <span className="flex-1 truncate">{option.specialtyName}</span>
              {isLocked && (
                <span className="opacity-60" title="Subscription required">
                  <Lock className="h-3.5 w-3.5" aria-label="Subscription required" />
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
