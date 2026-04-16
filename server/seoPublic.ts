import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

/**
 * Public site origin without trailing slash (e.g. https://prs-atlas.com).
 * Override in any environment with CANONICAL_PUBLIC_ORIGIN. In production, defaults to
 * https://prs-atlas.com so www→apex and HTML canonical work without extra config.
 */
export function getCanonicalOrigin(): string {
  const fromEnv = process.env.CANONICAL_PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return "https://prs-atlas.com";
  return "";
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

type RouteMeta = { title: string; description: string };

/** Paths that match public marketing pages (must stay aligned with usePageSeo on each page). */
const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Plastic Surgery Atlas Review | Q&A Study Platform",
    description:
      "Master plastic surgery with Atlas Review. 2500+ curated questions, detailed explanations, spaced repetition, mock exams, and oral board-style practice for comprehensive training and board prep.",
  },
  "/about": {
    title: "About Us | Plastic Surgery Atlas Review",
    description:
      "Learn the mission behind Atlas Review, a plastic surgery Q&A study platform with thousands of curated questions, structured topics, mock exams, spaced repetition, and oral board-style coaching for serious learners.",
  },
  "/the-atlas-way": {
    title: "The Atlas Way | How We Approach Plastic Surgery Exam Prep",
    description:
      "Discover the Atlas Way through a plastic surgery question bank, timed mock exams, and oral board coach. Try an embedded preview of Test Mode with navigator, flags, MCQ layout, and sample items, then see how structured study and exam-style UI reinforce each other.",
  },
  "/contact": {
    title: "Contact Us | Plastic Surgery Atlas Review",
    description:
      "Contact Atlas Review at hello@prs-atlas.com for account help, study tips, billing questions, and feedback. We answer plastic surgery trainees and board candidates as quickly as we can.",
  },
  "/pricing": {
    title: "Pricing & Plans | Plastic Surgery Atlas Review",
    description:
      "Atlas Review pricing includes flexible monthly ($50), 6-month ($270), and annual plans with promotional savings plus institutional codes. Compare plans and unlock the full plastic surgery Q&A bank, mock exams, spaced repetition, and oral board practice.",
  },
  "/oral-boards-coach": {
    title: "Oral Boards Coach | Interactive Plastic Surgery Oral Exam Prep | Atlas Review",
    description:
      "Deep dive into Atlas Review’s Oral Boards Coach with configurable plastic surgery oral board practice, conversational sessions, streaming responses, scoring and hinting controls, session history, and how it complements multiple-choice prep for certification-style study.",
  },
  "/terms": {
    title: "Terms Of Use | Plastic Surgery Atlas Review",
    description:
      "Terms Of Use for Atlas Review by PRS Atlas, LLC: subscriptions, accounts, acceptable use, content protection, limitations of liability, and governing law for https://prs-atlas.com.",
  },
  "/privacy": {
    title: "Privacy Policy | Plastic Surgery Atlas Review",
    description:
      "How PRS Atlas, LLC collects, uses, and shares data for Atlas Review (https://prs-atlas.com). California rights and requests at support@prsatlas.com.",
  },
};

function normalizePathname(urlPath: string): string {
  const p = urlPath.split("?")[0]?.split("#")[0] || "/";
  if (p === "/" || p === "") return "/";
  return p.endsWith("/") ? p.slice(0, -1) || "/" : p;
}

function metaForPath(pathname: string): RouteMeta | undefined {
  return ROUTE_META[normalizePathname(pathname)];
}

/**
 * Injects per-route title, meta description, and canonical link into the SPA index.html shell.
 */
export function injectSpaIndexHtml(html: string, requestPathWithQuery: string): string {
  const canonical = getCanonicalOrigin();
  if (!canonical) return html;

  const pathname = normalizePathname(requestPathWithQuery);
  const meta = metaForPath(pathname);
  if (!meta) return html;

  const canonicalUrl = new URL(pathname === "/" ? "/" : pathname, `${canonical}/`).href;
  const titleEscaped = meta.title.replace(/</g, "");
  const descEscaped = escapeAttr(meta.description);

  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${titleEscaped}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${descEscaped}" />`,
  );

  const canonicalTag = `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`;
  if (/<link\s+rel="canonical"/i.test(out)) {
    out = out.replace(/<link\s+rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    out = out.replace("</head>", `    ${canonicalTag}\n  </head>`);
  }

  return out;
}

const SITEMAP_PATHS = [
  "/",
  "/about",
  "/the-atlas-way",
  "/contact",
  "/pricing",
  "/oral-boards-coach",
  "/terms",
  "/privacy",
] as const;

function buildSitemapXml(base: string): string {
  const origin = base.replace(/\/$/, "");
  const lastMod = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PATHS.map(
    (p) =>
      `  <url>\n    <loc>${escapeAttr(`${origin}${p === "/" ? "/" : p}`)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.8"}</priority>\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * 301 www→apex and http→https when CANONICAL_PUBLIC_ORIGIN is https (or inferred in production).
 */
export function canonicalHostRedirect(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  const canonical = getCanonicalOrigin();
  if (!canonical) {
    next();
    return;
  }

  let canonicalHost: string;
  let needHttps: boolean;
  try {
    const parsed = new URL(canonical.endsWith("/") ? canonical : `${canonical}/`);
    canonicalHost = parsed.hostname.toLowerCase();
    needHttps = parsed.protocol === "https:";
  } catch {
    next();
    return;
  }

  const rawHost = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  const host = rawHost.split(":")[0].toLowerCase();
  if (!host) {
    next();
    return;
  }

  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.toLowerCase();
  const isTls =
    forwardedProto === "https" || (req.socket as { encrypted?: boolean }).encrypted === true;

  const pathWithQuery = req.originalUrl || "/";

  if (host === `www.${canonicalHost}`) {
    const dest = new URL(pathWithQuery, `${canonical.replace(/\/$/, "")}/`).href;
    res.redirect(301, dest);
    return;
  }

  if (needHttps && !isTls && host === canonicalHost) {
    const dest = new URL(pathWithQuery, `https://${canonicalHost}/`).href;
    res.redirect(301, dest);
    return;
  }

  next();
}

/**
 * Registers GET /robots.txt and GET /sitemap.xml before static middleware.
 */
export function registerSeoPublicRoutes(app: Express): void {
  app.get("/robots.txt", (_req, res) => {
    const base = getCanonicalOrigin() || "https://prs-atlas.com";
    const lines = [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${base.replace(/\/$/, "")}/sitemap.xml`,
      "",
    ];
    res.type("text/plain").send(lines.join("\n"));
  });

  app.get("/sitemap.xml", (_req, res) => {
    const base = getCanonicalOrigin() || "https://prs-atlas.com";
    res
      .status(200)
      .setHeader("Content-Type", "application/xml; charset=utf-8")
      .send(buildSitemapXml(base));
  });
}
