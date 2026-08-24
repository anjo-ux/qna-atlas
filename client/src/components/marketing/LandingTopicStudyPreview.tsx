import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostSpecialty } from "@/hooks/useSpecialty";

function wheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function findScrollableAncestor(start: HTMLElement): HTMLElement | Window {
  let node = start.parentElement;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    const scrolls =
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight + 1;
    if (scrolls) return node;
    node = node.parentElement;
  }
  return window;
}

/** When a nested scroller hits its edge, continue scrolling the page (or nearest ancestor). */
function usePassWheelPastNestedScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const delta = wheelDeltaY(event);
      if (delta === 0) return;

      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= maxScroll - 1;
      const trapped = maxScroll > 0 && ((delta < 0 && !atTop) || (delta > 0 && !atBottom));
      if (trapped) return;

      const ancestor = findScrollableAncestor(el);
      event.preventDefault();
      if (ancestor === window) {
        window.scrollBy(0, delta);
      } else {
        ancestor.scrollTop += delta;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}

type PreviewSection = {
  title: string;
  subs: { title: string; count: number }[];
};

type SectionMeta = {
  id: string;
  title: string;
  subsections: { id: string; title: string; questionCount: number }[];
};

/** Representative PRS curriculum tree for marketing only (not live bank data). */
const PRS_PREVIEW_SECTIONS: PreviewSection[] = [
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
];

function stripSectionPrefix(title: string): string {
  return title.replace(/^Section\s+\d+:\s*/i, "").trim() || title;
}

function metaToPreview(meta: SectionMeta[]): PreviewSection[] {
  return meta
    .map((section) => ({
      title: stripSectionPrefix(section.title),
      subs: (section.subsections ?? [])
        .map((sub) => ({
          title: sub.title,
          count: sub.questionCount ?? 0,
        }))
        .filter((sub) => sub.count > 0),
    }))
    .filter((section) => section.subs.length > 0);
}

function PreviewTree({
  previewSections,
  className,
}: {
  previewSections: PreviewSection[];
  className?: string;
}) {
  const totalSubs = previewSections.reduce((n, s) => n + s.subs.length, 0);
  const listRef = usePassWheelPastNestedScroll<HTMLDivElement>();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-gradient-to-b from-card via-card to-muted/30 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        className,
      )}
    >
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Sections ({previewSections.length})
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {totalSubs} Subsections In The Full Bank
        </p>
      </div>
      <div
        ref={listRef}
        className={cn(
          "h-52 overflow-y-auto overflow-x-hidden overscroll-y-auto sm:h-72",
          "max-lg:[-ms-overflow-style:none] max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="space-y-5 p-4">
          {previewSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden />
                <h4 className="min-w-0 text-pretty text-xs font-semibold uppercase leading-snug tracking-wide text-foreground">
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
                    <span className="min-w-0 text-pretty text-xs leading-snug">{sub.title}</span>
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

/**
 * Sidebar-style preview of in-app topic navigation.
 * PRS uses a curated static tree; Ortho loads live host specialty metadata (counts only).
 */
export function LandingTopicStudyPreview({ className }: { className?: string }) {
  const specialty = useHostSpecialty();
  const isOrtho = specialty.id === "ortho";

  const { data: orthoMeta = [], isLoading } = useQuery<SectionMeta[]>({
    queryKey: ["/api/sections/meta", "landing-topic-preview", "ortho"],
    enabled: isOrtho,
    queryFn: async () => {
      const res = await fetch("/api/sections/meta?specialtyId=ortho", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch Ortho section metadata");
      return res.json();
    },
    staleTime: 60_000,
  });

  if (!isOrtho) {
    return <PreviewTree previewSections={PRS_PREVIEW_SECTIONS} className={className} />;
  }

  const previewSections = metaToPreview(orthoMeta);

  if (isLoading && previewSections.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground sm:h-72",
          className,
        )}
      >
        Loading Ortho topics…
      </div>
    );
  }

  if (previewSections.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground sm:h-72",
          className,
        )}
      >
        Ortho topics coming soon.
      </div>
    );
  }

  return <PreviewTree previewSections={previewSections} className={className} />;
}
