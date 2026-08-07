/**
 * Single source of truth for public marketing metadata (SEO + AEO-friendly).
 * Keep server/seoPublic injectSpaIndexHtml and usePageSeo aligned with these records.
 *
 * Each specialty (host) has its own catalog; path keys are identical across specialties.
 */
import { DEFAULT_SPECIALTY_ID, getSpecialty, type SpecialtyId } from "./specialties";

export type PublicPageSeo = {
  /** ≤ ~60 chars; primary keywords early */
  title: string;
  /** ≤ ~155–165 chars; answer intent for snippets & answer engines */
  description: string;
  /** Comma-separated phrases; entity + intent for crawlers */
  keywords: string;
  /** Defaults to title if omitted in injection */
  ogTitle?: string;
  /** Defaults to description */
  ogDescription?: string;
};

const PRS_PAGE_SEO: Record<string, PublicPageSeo> = {
  "/": {
    title: "Plastic Surgery Board Prep & Q&A Bank | Atlas Review",
    description:
      "Atlas Review: 2,500+ plastic surgery board-style questions, detailed explanations, spaced repetition, mock exams, and oral board coaching. Study for ABS certification with a structured Q&A platform built for trainees.",
    keywords:
      "plastic surgery board prep, ABS exam questions, plastic surgery Q&A, board review plastic surgery, oral boards plastic surgery, mock exam plastic surgery, spaced repetition medical, Atlas Review, PRS Atlas",
    ogTitle: "Atlas Review | Plastic Surgery Board Prep & 2,500+ Q&A",
    ogDescription:
      "Board-style plastic surgery questions, explanations, mock exams, and oral board practice. Train online with Atlas Review.",
  },
  "/about": {
    title: "About Atlas Review | Plastic Surgery Education Platform",
    description:
      "Who we are: Atlas Review helps plastic surgery residents and fellows prepare for boards with a curated question bank, mock exams, spaced repetition, and oral board coaching—built for serious, structured study.",
    keywords:
      "Atlas Review about, plastic surgery education platform, PRS Atlas LLC, plastic surgery study app, board prep company, curated question bank",
    ogTitle: "About Atlas Review | Plastic Surgery Board Study Mission",
    ogDescription:
      "Mission-driven plastic surgery Q&A and exam prep: thousands of vetted questions, analytics, and tools for certification-ready study.",
  },
  "/the-atlas-way": {
    title: "The Atlas Way | How We Teach Plastic Surgery Exam Prep",
    description:
      "How Atlas Review works: guided study paths, test mode with navigator and flags, timed mocks, and oral board-style practice—so you learn clinical reasoning, not just recall.",
    keywords:
      "plastic surgery study method, exam prep approach, Atlas Way, timed mock exams, test mode study, clinical reasoning boards",
    ogTitle: "The Atlas Way | Plastic Surgery Study & Exam Workflow",
    ogDescription:
      "See how Atlas Review combines structured topics, exam UI, mocks, and oral practice into one board prep workflow.",
  },
  "/preview": {
    title: "Free Plastic Surgery Board Q&A Preview | Atlas Review Test Mode",
    description:
      "Try Atlas Review in your browser: free interactive preview of plastic surgery board-style MCQs with exam navigator, flags, and reviewer layout—see how our Q&A bank works before you subscribe.",
    keywords:
      "plastic surgery board prep demo, free MCQ preview, Atlas Review test mode, plastic surgery question bank try, board exam simulator preview, ABS study sample questions",
    ogTitle: "Free Test Mode Preview | Plastic Surgery Board Q&A | Atlas Review",
    ogDescription:
      "Sample exam-style navigation and plastic surgery questions—interactive preview, no account required to explore the interface.",
  },
  "/contact": {
    title: "Contact Atlas Review | Support, Billing & Partnerships",
    description:
      "How to reach Atlas Review: email hello@prs-atlas.com for accounts, billing, and feedback—support for trainees, programs, and institutional access questions.",
    keywords:
      "Atlas Review contact, plastic surgery app support, hello@prs-atlas.com, billing help Atlas Review, institutional access contact",
    ogTitle: "Contact Atlas Review | Help & Billing",
    ogDescription:
      "Get account help, billing answers, or partnership inquiries—reach our team at hello@prs-atlas.com.",
  },
  "/pricing": {
    title: "Atlas Review Pricing | Plastic Surgery Board Prep Plans",
    description:
      "Compare Atlas Review plans: monthly ($50), 6-month ($270), annual savings, and institutional codes. Full Q&A bank, mocks, spaced repetition, and oral boards coach included on every paid tier.",
    keywords:
      "Atlas Review price, plastic surgery board prep cost, monthly subscription medical education, institutional code Atlas Review, ABS prep pricing",
    ogTitle: "Atlas Review Plans & Pricing | Board Prep",
    ogDescription:
      "Flexible pricing for plastic surgery board prep—monthly, 6-month, and annual access with the full feature set.",
  },
  "/oral-boards-coach": {
    title: "Plastic Surgery Oral Board Practice | Atlas Review Coach",
    description:
      "Practice oral board-style cases with Atlas Review’s interactive coach: conversational sessions, scoring, hints, and session history to complement your multiple-choice board prep.",
    keywords:
      "plastic surgery oral boards, oral board practice, verbal exam prep plastic surgery, ABS oral prep, Atlas Review coach, mock oral plastic surgery",
    ogTitle: "Oral Boards Coach | Plastic Surgery Verbal Exam Prep",
    ogDescription:
      "Interactive oral board-style practice for plastic surgery—streaming sessions, feedback, and history alongside your Q&A bank.",
  },
  "/terms": {
    title: "Terms of Use | Atlas Review (PRS Atlas, LLC)",
    description:
      "Terms of Use for Atlas Review at prs-atlas.com: subscriptions, accounts, acceptable use, intellectual property, limitation of liability, and governing law for PRS Atlas, LLC.",
    keywords:
      "Atlas Review terms of use, PRS Atlas terms, plastic surgery app legal, subscription terms Atlas Review",
    ogTitle: "Terms of Use | Atlas Review",
    ogDescription:
      "Terms governing use of Atlas Review and prs-atlas.com, including subscriptions and acceptable use.",
  },
  "/privacy": {
    title: "Privacy Policy | Atlas Review | PRS Atlas, LLC",
    description:
      "Privacy Policy for Atlas Review: what data we collect, how we use it, sharing, retention, California privacy rights, and contacting support@prsatlas.com or via prs-atlas.com.",
    keywords:
      "Atlas Review privacy policy, PRS Atlas privacy, California privacy rights, medical education app privacy",
    ogTitle: "Privacy Policy | Atlas Review",
    ogDescription:
      "How PRS Atlas, LLC handles personal information for Atlas Review users and visitors.",
  },
};

const ORTHO_PAGE_SEO: Record<string, PublicPageSeo> = {
  "/": {
    title: "Orthopaedic Surgery Board Prep & Q&A Bank | Ortho Atlas",
    description:
      "Ortho Atlas: orthopaedic surgery board-style questions with detailed explanations, spaced repetition, timed mock exams, and oral board coaching. Structured OITE and ABOS study built for residents and fellows.",
    keywords:
      "orthopaedic surgery board prep, OITE questions, ABOS exam questions, orthopedic surgery Q&A, board review orthopaedics, oral boards orthopaedic surgery, spaced repetition medical, Ortho Atlas",
    ogTitle: "Ortho Atlas | Orthopaedic Surgery Board Prep & Q&A",
    ogDescription:
      "Board-style orthopaedic surgery questions, explanations, mock exams, and oral board practice. Train online with Ortho Atlas.",
  },
  "/about": {
    title: "About Ortho Atlas | Orthopaedic Surgery Education Platform",
    description:
      "Who we are: Ortho Atlas helps orthopaedic surgery residents and fellows prepare for the OITE and ABOS boards with a curated question bank, mock exams, spaced repetition, and oral board coaching.",
    keywords:
      "Ortho Atlas about, orthopaedic surgery education platform, orthopedic study app, board prep company, curated question bank orthopaedics",
    ogTitle: "About Ortho Atlas | Orthopaedic Board Study Mission",
    ogDescription:
      "Mission-driven orthopaedic surgery Q&A and exam prep: vetted questions, analytics, and tools for certification-ready study.",
  },
  "/the-atlas-way": {
    title: "The Atlas Way | How We Teach Orthopaedic Exam Prep",
    description:
      "How Ortho Atlas works: guided study paths, test mode with navigator and flags, timed mocks, and oral board-style practice—so you learn orthopaedic clinical reasoning, not just recall.",
    keywords:
      "orthopaedic surgery study method, OITE prep approach, Atlas Way, timed mock exams, test mode study, clinical reasoning orthopaedics",
    ogTitle: "The Atlas Way | Orthopaedic Study & Exam Workflow",
    ogDescription:
      "See how Ortho Atlas combines structured topics, exam UI, mocks, and oral practice into one board prep workflow.",
  },
  "/preview": {
    title: "Free Orthopaedic Board Q&A Preview | Ortho Atlas Test Mode",
    description:
      "Try Ortho Atlas in your browser: free interactive preview of orthopaedic surgery board-style MCQs with exam navigator, flags, and reviewer layout—see how our Q&A bank works before you subscribe.",
    keywords:
      "orthopaedic board prep demo, free MCQ preview, Ortho Atlas test mode, orthopedic question bank try, OITE simulator preview, ABOS sample questions",
    ogTitle: "Free Test Mode Preview | Orthopaedic Board Q&A | Ortho Atlas",
    ogDescription:
      "Sample exam-style navigation and orthopaedic surgery questions—interactive preview, no account required to explore the interface.",
  },
  "/contact": {
    title: "Contact Ortho Atlas | Support, Billing & Partnerships",
    description:
      "How to reach Ortho Atlas: email hello@ortho-atlas.com for accounts, billing, and feedback—support for trainees, programs, and institutional access questions.",
    keywords:
      "Ortho Atlas contact, orthopaedic app support, hello@ortho-atlas.com, billing help Ortho Atlas, institutional access contact",
    ogTitle: "Contact Ortho Atlas | Help & Billing",
    ogDescription:
      "Get account help, billing answers, or partnership inquiries—reach our team at hello@ortho-atlas.com.",
  },
  "/pricing": {
    title: "Ortho Atlas Pricing | Orthopaedic Board Prep Plans",
    description:
      "Compare Ortho Atlas plans: monthly ($50), 6-month ($270), annual savings, and institutional codes. Full Q&A bank, mocks, spaced repetition, and oral boards coach included on every paid tier.",
    keywords:
      "Ortho Atlas price, orthopaedic board prep cost, monthly subscription medical education, institutional code Ortho Atlas, OITE prep pricing",
    ogTitle: "Ortho Atlas Plans & Pricing | Board Prep",
    ogDescription:
      "Flexible pricing for orthopaedic board prep—monthly, 6-month, and annual access with the full feature set.",
  },
  "/oral-boards-coach": {
    title: "Orthopaedic Oral Board Practice | Ortho Atlas Coach",
    description:
      "Practice oral board-style cases with the Ortho Atlas interactive coach: conversational sessions, scoring, hints, and session history to complement your multiple-choice board prep.",
    keywords:
      "orthopaedic oral boards, oral board practice, ABOS Part II prep, verbal exam prep orthopaedics, Ortho Atlas coach, mock oral orthopaedic surgery",
    ogTitle: "Oral Boards Coach | Orthopaedic Verbal Exam Prep",
    ogDescription:
      "Interactive oral board-style practice for orthopaedic surgery—streaming sessions, feedback, and history alongside your Q&A bank.",
  },
  "/terms": {
    title: "Terms of Use | Ortho Atlas (PRS Atlas, LLC)",
    description:
      "Terms of Use for Ortho Atlas at ortho-atlas.com: subscriptions, accounts, acceptable use, intellectual property, limitation of liability, and governing law for PRS Atlas, LLC.",
    keywords:
      "Ortho Atlas terms of use, orthopaedic app legal, subscription terms Ortho Atlas",
    ogTitle: "Terms of Use | Ortho Atlas",
    ogDescription:
      "Terms governing use of Ortho Atlas and ortho-atlas.com, including subscriptions and acceptable use.",
  },
  "/privacy": {
    title: "Privacy Policy | Ortho Atlas | PRS Atlas, LLC",
    description:
      "Privacy Policy for Ortho Atlas: what data we collect, how we use it, sharing, retention, California privacy rights, and contacting support@prsatlas.com or via ortho-atlas.com.",
    keywords:
      "Ortho Atlas privacy policy, orthopaedic app privacy, California privacy rights, medical education app privacy",
    ogTitle: "Privacy Policy | Ortho Atlas",
    ogDescription:
      "How PRS Atlas, LLC handles personal information for Ortho Atlas users and visitors.",
  },
};

export const PUBLIC_PAGE_SEO_BY_SPECIALTY: Record<SpecialtyId, Record<string, PublicPageSeo>> = {
  prs: PRS_PAGE_SEO,
  ortho: ORTHO_PAGE_SEO,
};

function normalize(pathname: string): string {
  const p = pathname.split("?")[0]?.split("#")[0] || "/";
  return p === "" ? "/" : p.endsWith("/") && p.length > 1 ? p.slice(0, -1) || "/" : p;
}

export function getPublicPageSeo(
  pathname: string,
  specialtyId: SpecialtyId = DEFAULT_SPECIALTY_ID,
): PublicPageSeo | undefined {
  const catalog = PUBLIC_PAGE_SEO_BY_SPECIALTY[getSpecialty(specialtyId).id];
  return catalog[normalize(pathname)];
}
