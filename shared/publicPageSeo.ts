/**
 * Single source of truth for public marketing metadata (SEO + AEO-friendly).
 * Keep server/seoPublic injectSpaIndexHtml and usePageSeo aligned with these records.
 */
export const SITE_ORIGIN = "https://prs-atlas.com";

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

export const PUBLIC_PAGE_SEO: Record<string, PublicPageSeo> = {
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

export function getPublicPageSeo(pathname: string): PublicPageSeo | undefined {
  const p = pathname.split("?")[0]?.split("#")[0] || "/";
  const n = p === "" ? "/" : p.endsWith("/") && p.length > 1 ? p.slice(0, -1) || "/" : p;
  return PUBLIC_PAGE_SEO[n];
}
