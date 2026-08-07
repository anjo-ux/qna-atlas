import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHostSpecialty, useSwitchMarketingSpecialty } from "@/hooks/useSpecialty";
import { SPECIALTY_LIST } from "@shared/specialties";
import { cn } from "@/lib/utils";

type SpecialtySubheaderDropdownProps = {
  className?: string;
  /** Visual scale: nav uses `nav`, landing hero uses `hero`. */
  size?: "nav" | "hero";
  align?: "start" | "center" | "end";
};

/** Stacked solid carets from the selector reference, via currentColor. */
function DualCaret({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden
      className={cn("shrink-0 text-primary", className)}
    >
      <path d="M5 1.25 9.25 6H.75L5 1.25Z" />
      <path d="M5 12.75 0.75 8h8.5L5 12.75Z" />
    </svg>
  );
}

/**
 * Specialty picker styled like the inset-pill selector reference:
 * frosted glass shell, active row as a pill with dual carets, muted siblings.
 */
export function SpecialtySubheaderDropdown({
  className,
  size = "nav",
  align = "start",
}: SpecialtySubheaderDropdownProps) {
  const specialty = useHostSpecialty();
  const switchSpecialty = useSwitchMarketingSpecialty();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex max-w-full items-center justify-between font-semibold tracking-tight text-foreground outline-none transition-colors",
            "rounded-full glass-surface border-glass",
            "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            "data-[state=open]:brightness-[0.98] dark:data-[state=open]:brightness-110",
            size === "nav" && "min-w-[9.5rem] gap-2 px-2.5 py-1.5 text-xs leading-snug",
            size === "hero" &&
              "min-w-[14rem] gap-3 px-4 py-2 text-lg leading-snug sm:min-w-[16rem] sm:px-5 sm:py-2.5 sm:text-xl",
            className,
          )}
          data-testid="button-specialty-subheader"
          aria-label={`Question bank: ${specialty.specialtyName}. Switch specialty.`}
        >
          <span className="truncate">{specialty.specialtyName}</span>
          <DualCaret className={size === "nav" ? "h-3 w-2" : "h-4 w-2.5 sm:h-5 sm:w-3"} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn(
          "min-w-[14rem] overflow-hidden rounded-2xl border-0 bg-transparent p-1.5 text-foreground shadow-xl",
          "glass-surface",
          "ring-1 ring-white/45 dark:ring-white/15",
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        {SPECIALTY_LIST.map((option) => {
          const isActive = option.id === specialty.id;
          return (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => switchSpecialty(option.id)}
              className={cn(
                "cursor-pointer gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium outline-none",
                "focus:bg-transparent focus:text-foreground",
                isActive
                  ? "bg-black/[0.08] text-foreground focus:bg-black/[0.08] dark:bg-white/15 dark:focus:bg-white/15"
                  : "text-muted-foreground focus:bg-black/[0.04] focus:text-foreground dark:focus:bg-white/[0.06]",
              )}
              data-testid={`menuitem-marketing-specialty-${option.id}`}
            >
              <span className="flex-1 truncate">{option.specialtyName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
