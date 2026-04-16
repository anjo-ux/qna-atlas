import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Representative curriculum tree for marketing only (not live bank data). */
const PREVIEW_SECTIONS = [
  {
    title: "Foundations & Core Principles",
    subs: [
      { title: "Wound Healing & Scar Biology", count: 38 },
      { title: "Skin Anatomy & Flap Physiology", count: 44 },
      { title: "Ethics, Consent, & Professionalism", count: 29 },
    ],
  },
  {
    title: "Breast & Chest Wall",
    subs: [
      { title: "Breast Reduction & Mastopexy", count: 52 },
      { title: "Oncologic Breast Reconstruction", count: 61 },
      { title: "Chest Wall & Poland Syndrome", count: 24 },
    ],
  },
  {
    title: "Craniofacial & Pediatric",
    subs: [
      { title: "Cleft Lip & Palate", count: 47 },
      { title: "Craniosynostosis & Vault", count: 33 },
      { title: "Facial Trauma & Fractures", count: 41 },
    ],
  },
  {
    title: "Hand & Upper Extremity",
    subs: [
      { title: "Acute Hand Trauma", count: 56 },
      { title: "Peripheral Nerve & Compression", count: 39 },
      { title: "Congenital Hand", count: 22 },
    ],
  },
  {
    title: "Lower Extremity & Wounds",
    subs: [
      { title: "Lower Extremity Trauma", count: 48 },
      { title: "Chronic Wounds & Pressure Injury", count: 35 },
      { title: "Lymphedema & Microsurgery", count: 31 },
    ],
  },
  {
    title: "Cosmetic & Aesthetic",
    subs: [
      { title: "Facial Aging & Rhytidectomy", count: 43 },
      { title: "Body Contouring", count: 36 },
      { title: "Periorbital & Rhinoplasty", count: 51 },
    ],
  },
] as const;

const totalSubs = PREVIEW_SECTIONS.reduce((n, s) => n + s.subs.length, 0);

/**
 * Static sidebar-style preview of the in-app topic navigation (marketing only).
 */
export function LandingTopicStudyPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-gradient-to-b from-card via-card to-muted/30 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        className,
      )}
    >
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Sections ({PREVIEW_SECTIONS.length})</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {totalSubs} Subsections In The Full Bank
        </p>
      </div>
      <div
        className={cn(
          "h-64 overflow-y-auto overflow-x-hidden overscroll-y-contain sm:h-72",
          /* Radix ScrollArea always paints a track; native scroll hides chrome on phones/tablets */
          "max-lg:[-ms-overflow-style:none] max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="space-y-5 p-4">
          {PREVIEW_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden />
                <h4 className="truncate text-xs font-semibold uppercase tracking-wide text-foreground">
                  {section.title}
                </h4>
              </div>
              <div className="space-y-0.5 pl-1">
                {section.subs.map((sub) => (
                  <Button
                    key={sub.title}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-auto w-full justify-between gap-2 py-1.5 text-left font-normal text-muted-foreground opacity-100"
                  >
                    <span className="truncate text-xs">{sub.title}</span>
                    <span className="shrink-0 tabular-nums text-[11px] opacity-70">{sub.count}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
