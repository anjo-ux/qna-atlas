/**
 * Single source of truth for the multi-specialty / multi-domain platform.
 *
 * One deployment serves every specialty. Which one a request belongs to is resolved two ways:
 *  - Host (prs-atlas.com vs ortho-atlas.com) → marketing/landing/signup default
 *  - `users.active_specialty_id` → the logged-in question bank (content, theme, entitlement)
 */

export const SPECIALTY_IDS = ["prs", "ortho"] as const;
export type SpecialtyId = (typeof SPECIALTY_IDS)[number];

export const DEFAULT_SPECIALTY_ID: SpecialtyId = "prs";

/** HSL triples (matching client/src/index.css tokens) applied via `[data-specialty="…"]`. */
export type SpecialtyThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  ring: string;
  navGradientStart: string;
  navGradientEnd: string;
};

export type SpecialtyConfig = {
  id: SpecialtyId;
  /** Human label for the specialty itself, e.g. "Plastic Surgery". */
  specialtyName: string;
  /** Short label for switchers/badges. */
  shortName: string;
  /** Product/brand name, e.g. "PRS Atlas". */
  brandName: string;
  /** Shared product family name shown next to the logo. */
  productName: string;
  /** Apex domain (no scheme). */
  apexHost: string;
  /** Every host that maps to this specialty (apex + www + any alias). */
  hosts: readonly string[];
  canonicalOrigin: string;
  legalEntity: string;
  contactEmail: string;
  supportEmail: string;
  instagramUrl: string;
  /** Prefix required on this specialty's section/subsection ids so global PKs never collide. */
  contentIdPrefix: string;
  /** Marketing strings that must not claim PRS content volume on other specialty domains. */
  marketing: {
    /** Hero headline, e.g. "Plastic Surgery Atlas". */
    heroTitle: string;
    heroSubtitle: string;
    /** Stat shown on the landing page / pricing bullets. */
    questionCountLabel: string;
    questionCountBullet: string;
    examName: string;
    /** Short label for mock-exam UI chrome, e.g. "Plastic Surgery" or "Ortho". */
    mockExamLabel: string;
    /** Specialty/subspecialty chips in oral board session setup. */
    oralSpecialtyOptions: readonly string[];
    /** Inline prose list of representative subspecialty domains. */
    subspecialtyExamples: string;
  };
  theme: { light: SpecialtyThemeTokens; dark: SpecialtyThemeTokens };
};

export const SPECIALTIES: Record<SpecialtyId, SpecialtyConfig> = {
  prs: {
    id: "prs",
    specialtyName: "Plastic Surgery",
    shortName: "Plastic Surgery",
    brandName: "PRS Atlas",
    productName: "Atlas Review",
    apexHost: "prs-atlas.com",
    hosts: ["prs-atlas.com", "www.prs-atlas.com"],
    canonicalOrigin: "https://prs-atlas.com",
    legalEntity: "PRS Atlas, LLC",
    contactEmail: "hello@prs-atlas.com",
    supportEmail: "support@prsatlas.com",
    instagramUrl: "https://www.instagram.com/prs_atlas?igsh=bDk1dmtld2Uzdnpt",
    contentIdPrefix: "",
    marketing: {
      heroTitle: "Plastic Surgery Atlas",
      heroSubtitle:
        "Master Comprehensive Plastic Surgery Knowledge Through Interactive Questions, Detailed Explanations, And Structured Learning Paths",
      questionCountLabel: "2500+",
      questionCountBullet: "2500+ Carefully Curated Questions.",
      examName: "In-Training Exam",
      mockExamLabel: "Plastic Surgery",
      oralSpecialtyOptions: ["Plastic Surgery", "Hand Surgery", "Burn Surgery"],
      subspecialtyExamples:
        "core principles to hand, craniomaxillofacial, breast, cosmetic, and comprehensive themes",
    },
    theme: {
      light: {
        primary: "210 85% 48%",
        secondary: "200 75% 58%",
        accent: "180 100% 35%",
        ring: "210 85% 48%",
        navGradientStart: "210 75% 48%",
        navGradientEnd: "200 80% 55%",
      },
      dark: {
        primary: "210 75% 65%",
        secondary: "200 80% 70%",
        accent: "180 100% 45%",
        ring: "210 75% 65%",
        navGradientStart: "210 75% 65%",
        navGradientEnd: "200 80% 70%",
      },
    },
  },
  ortho: {
    id: "ortho",
    specialtyName: "Orthopaedic Surgery",
    shortName: "Orthopaedic Surgery",
    brandName: "Ortho Atlas",
    productName: "Atlas Review",
    apexHost: "ortho-atlas.com",
    hosts: ["ortho-atlas.com", "www.ortho-atlas.com"],
    canonicalOrigin: "https://ortho-atlas.com",
    legalEntity: "PRS Atlas, LLC",
    contactEmail: "hello@ortho-atlas.com",
    supportEmail: "support@prsatlas.com",
    instagramUrl: "https://www.instagram.com/prs_atlas?igsh=bDk1dmtld2Uzdnpt",
    contentIdPrefix: "ortho-",
    /** Placeholder copy until the Ortho question bank and final branding land. */
    marketing: {
      heroTitle: "Orthopaedic Surgery Atlas",
      heroSubtitle:
        "Master Comprehensive Orthopaedic Surgery Knowledge Through Interactive Questions, Detailed Explanations, And Structured Learning Paths",
      questionCountLabel: "2500+",
      questionCountBullet: "2500+ Carefully Curated Board-Style Questions Across Every Major Domain.",
      examName: "OITE",
      mockExamLabel: "Ortho",
      oralSpecialtyOptions: ["Orthopaedic Surgery", "Trauma", "Sports Medicine"],
      subspecialtyExamples:
        "basic science to trauma, sports, spine, arthroplasty, hand, foot and ankle, pediatric, and oncology themes",
    },
    /** Placeholder palette (deep evergreen / bronze) until final Ortho branding lands. */
    theme: {
      light: {
        primary: "168 62% 30%",
        secondary: "158 45% 42%",
        accent: "28 78% 46%",
        ring: "168 62% 30%",
        navGradientStart: "168 62% 30%",
        navGradientEnd: "158 48% 38%",
      },
      dark: {
        primary: "162 55% 55%",
        secondary: "155 45% 62%",
        accent: "30 85% 58%",
        ring: "162 55% 55%",
        navGradientStart: "162 55% 50%",
        navGradientEnd: "155 45% 58%",
      },
    },
  },
};

export const SPECIALTY_LIST: readonly SpecialtyConfig[] = SPECIALTY_IDS.map((id) => SPECIALTIES[id]);

export function isSpecialtyId(value: unknown): value is SpecialtyId {
  return typeof value === "string" && (SPECIALTY_IDS as readonly string[]).includes(value);
}

export function getSpecialty(id: SpecialtyId | string | null | undefined): SpecialtyConfig {
  return isSpecialtyId(id) ? SPECIALTIES[id] : SPECIALTIES[DEFAULT_SPECIALTY_ID];
}

/** Normalizes a Host / X-Forwarded-Host value to a bare lowercase hostname. */
export function normalizeHostname(rawHost: string | null | undefined): string {
  if (!rawHost) return "";
  return rawHost.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

/**
 * Maps a hostname to its specialty. Unknown hosts (Replit preview URLs, localhost)
 * fall back to the default specialty so existing environments keep working.
 */
export function specialtyFromHostname(rawHost: string | null | undefined): SpecialtyId {
  const host = normalizeHostname(rawHost);
  if (!host) return DEFAULT_SPECIALTY_ID;
  for (const config of SPECIALTY_LIST) {
    if (config.hosts.includes(host)) return config.id;
  }
  return DEFAULT_SPECIALTY_ID;
}

/** True when the hostname is an explicitly configured production host for some specialty. */
export function isKnownSpecialtyHost(rawHost: string | null | undefined): boolean {
  const host = normalizeHostname(rawHost);
  if (!host) return false;
  return SPECIALTY_LIST.some((config) => config.hosts.includes(host));
}

/** Prefixed section/subsection id for a specialty (PRS keeps its historical unprefixed ids). */
export function specialtyContentId(specialtyId: SpecialtyId, rawId: string): string {
  const prefix = getSpecialty(specialtyId).contentIdPrefix;
  if (!prefix || rawId.startsWith(prefix)) return rawId;
  return `${prefix}${rawId}`;
}

/** Client bootstrap payload injected into the SPA shell by the server. */
export type SpecialtyBootstrap = {
  hostSpecialty: SpecialtyId;
};

export const SPECIALTY_BOOTSTRAP_GLOBAL = "__ATLAS_SPECIALTY__";
