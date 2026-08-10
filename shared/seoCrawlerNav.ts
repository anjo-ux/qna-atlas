import type { SpecialtyId } from "./specialties";

type MarketingNavLink = {
  href: string;
  label: string;
  /** When set, the link is only included for that specialty's sitemap / crawler nav. */
  specialtyIds?: readonly SpecialtyId[];
};

/**
 * Marketing paths for sitemap + server-injected crawler nav.
 * Ortho omits oral boards (product not shipped on Ortho Atlas yet).
 */
const ALL_MARKETING_NAV_LINKS: readonly MarketingNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/the-atlas-way", label: "The Atlas Way" },
  { href: "/preview", label: "Free Preview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/oral-boards-coach", label: "Oral Boards Coach", specialtyIds: ["prs"] },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

/** @deprecated Prefer getMarketingNavLinks(specialtyId) — kept for callers that only need PRS. */
export const MARKETING_NAV_LINKS = ALL_MARKETING_NAV_LINKS.filter(
  (l) => !l.specialtyIds || l.specialtyIds.includes("prs"),
);

export function getMarketingNavLinks(specialtyId: SpecialtyId = "prs"): {
  href: string;
  label: string;
}[] {
  return ALL_MARKETING_NAV_LINKS.filter(
    (link) => !link.specialtyIds || link.specialtyIds.includes(specialtyId),
  ).map(({ href, label }) => ({ href, label }));
}
