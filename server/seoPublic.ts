import type { Express, Request, Response, NextFunction } from "express";
import type { PublicPageSeo } from "../shared/publicPageSeo";
import { PUBLIC_PAGE_SEO, SITE_ORIGIN } from "../shared/publicPageSeo";
import { MARKETING_NAV_LINKS } from "../shared/seoCrawlerNav";
import { getStructuredData } from "../shared/seoStructuredData";

/**
 * Public site origin without trailing slash (e.g. https://prs-atlas.com).
 * Override in any environment with CANONICAL_PUBLIC_ORIGIN. In production, defaults to
 * https://prs-atlas.com so www→apex and HTML canonical work without extra config.
 */
export function normalizePublicOrigin(origin: string): string {
  const trimmed = origin.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = u.hostname.toLowerCase();
    const defaultPort = u.protocol === "https:" ? "443" : u.protocol === "http:" ? "80" : "";
    if (!u.port || u.port === defaultPort) return `${u.protocol}//${host}`;
    return `${u.protocol}//${host}:${u.port}`;
  } catch {
    return trimmed;
  }
}

export function getCanonicalOrigin(): string {
  const fromEnv = process.env.CANONICAL_PUBLIC_ORIGIN?.trim();
  if (fromEnv) return normalizePublicOrigin(fromEnv);
  if (process.env.NODE_ENV === "production") return "https://prs-atlas.com";
  return "";
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** App/auth paths — noindex in HTML and Disallow in robots.txt (not in sitemap). */
export const NON_INDEXABLE_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/reset-password",
  "/subscribe",
  "/bookmarks",
  "/spaced-repetition",
  "/oral-board",
  "/admin",
  "/api",
] as const;

function normalizePathname(urlPath: string): string {
  const p = urlPath.split("?")[0]?.split("#")[0] || "/";
  if (p === "/" || p === "") return "/";
  return p.endsWith("/") ? p.slice(0, -1) || "/" : p;
}

export function isMarketingIndexablePath(pathname: string): boolean {
  return metaForPath(pathname) !== undefined;
}

export function isNonIndexableAppPath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return NON_INDEXABLE_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

function metaForPath(pathname: string): PublicPageSeo | undefined {
  return PUBLIC_PAGE_SEO[normalizePathname(pathname)];
}

/** Strip :443 / :80 so redirect targets match canonical URLs (avoids GSC redirect validation issues). */
export function stripDefaultPortFromUrl(url: string): string {
  return url.replace(/:443(?=\/|$)/, "").replace(/:80(?=\/|$)/, "");
}

function buildRedirectUrl(pathWithQuery: string, origin: string): string {
  const base = normalizePublicOrigin(origin);
  const href = new URL(pathWithQuery || "/", `${base}/`).href;
  return stripDefaultPortFromUrl(href);
}

function redirect301(res: Response, target: string): void {
  res.redirect(301, stripDefaultPortFromUrl(target));
}

function injectAbsoluteFavicons(html: string, origin: string): string {
  const base = normalizePublicOrigin(origin);
  // Cache-bust so Google/browsers pick up the glass icon; 48px PNG first for Search.
  const v = "20260721d";
  const iconBlock = [
    `<link rel="icon" type="image/png" sizes="48x48" href="${base}/favicon-48.png?v=${v}" />`,
    `<link rel="icon" type="image/png" sizes="192x192" href="${base}/favicon-192.png?v=${v}" />`,
    `<link rel="shortcut icon" href="${base}/favicon-48.png?v=${v}" />`,
    `<link rel="icon" href="${base}/favicon.ico?v=${v}" sizes="48x48" />`,
    `<link rel="apple-touch-icon" href="${base}/apple-touch-icon.png?v=${v}" />`,
    `<link rel="manifest" href="${base}/site.webmanifest?v=${v}" />`,
  ].join("\n    ");
  let out = html.replace(/<link\s+rel="icon"[^>]*>\s*/gi, "");
  out = out.replace(/<link\s+rel="apple-touch-icon"[^>]*>\s*/gi, "");
  out = out.replace(/<link\s+rel="manifest"[^>]*>\s*/gi, "");
  return out.replace("</head>", `    ${iconBlock}\n  </head>`);
}

function injectCrawlerSiteNav(html: string, origin: string): string {
  const base = normalizePublicOrigin(origin);
  const links = MARKETING_NAV_LINKS.map(({ href, label }) => {
    const url = href === "/" ? `${base}/` : `${base}${href}`;
    return `<a href="${escapeAttr(url)}">${label}</a>`;
  }).join("\n      ");
  const footer = `<footer id="seo-crawler-nav" aria-label="Site pages">
    <nav>
      ${links}
    </nav>
  </footer>`;
  if (/<footer\s+id="seo-crawler-nav"/i.test(html)) {
    return html.replace(/<footer\s+id="seo-crawler-nav"[\s\S]*?<\/footer>/i, footer);
  }
  return html.replace("</body>", `  ${footer}\n  </body>`);
}

function setMetaName(html: string, name: string, content: string): string {
  const tag = `<meta name="${escapeAttr(name)}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta\\s+name="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function setMetaProperty(html: string, property: string, content: string): string {
  const tag = `<meta property="${escapeAttr(property)}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(
    `<meta\\s+property="${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`,
    "i",
  );
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function injectMarketingHeadTags(
  html: string,
  pathname: string,
  meta: PublicPageSeo,
  canonicalUrl: string,
  origin: string,
): string {
  const ogTitle = meta.ogTitle ?? meta.title;
  const ogDescription = meta.ogDescription ?? meta.description;
  const normOrigin = normalizePublicOrigin(origin);
  const ogImage = `${normOrigin}/atlas-logo.png`;

  let out = setMetaName(html, "keywords", meta.keywords);
  out = setMetaProperty(out, "og:title", ogTitle);
  out = setMetaProperty(out, "og:description", ogDescription);
  out = setMetaProperty(out, "og:url", canonicalUrl);
  out = setMetaProperty(out, "og:type", "website");
  out = setMetaProperty(out, "og:image", ogImage);
  out = setMetaProperty(out, "og:site_name", "Atlas Review");
  out = setMetaProperty(out, "og:locale", "en_US");

  out = setMetaName(out, "twitter:card", "summary_large_image");
  out = setMetaName(out, "twitter:title", ogTitle);
  out = setMetaName(out, "twitter:description", ogDescription);
  out = setMetaName(out, "twitter:image", ogImage);

  const structured = getStructuredData(pathname, normOrigin);
  if (structured) {
    const raw = JSON.stringify(structured).replace(/</g, "\\u003c");
    const script = `<script type="application/ld+json" id="atlas-structured-data">${raw}</script>`;
    if (/<script[^>]*id="atlas-structured-data"/i.test(out)) {
      out = out.replace(/<script[^>]*id="atlas-structured-data"[^>]*>[\s\S]*?<\/script>/i, script);
    } else {
      out = out.replace("</head>", `    ${script}\n  </head>`);
    }
  }

  return out;
}

function injectRobotsMeta(html: string, content: string): string {
  const tag = `<meta name="robots" content="${escapeAttr(content)}" />`;
  if (/<meta\s+name="robots"/i.test(html)) {
    return html.replace(/<meta\s+name="robots"[^>]*>/i, tag);
  }
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

/**
 * Injects per-route title, meta description, canonical, or noindex into the SPA index.html shell.
 */
export function injectSpaIndexHtml(html: string, requestPathWithQuery: string): string {
  const canonical = getCanonicalOrigin();
  if (!canonical) return html;

  const pathname = normalizePathname(requestPathWithQuery);

  if (isNonIndexableAppPath(pathname)) {
    return injectRobotsMeta(html, "noindex, nofollow");
  }

  const meta = metaForPath(pathname);
  if (!meta) {
    return injectRobotsMeta(html, "noindex, nofollow");
  }

  const canonicalUrl = buildRedirectUrl(pathname === "/" ? "/" : pathname, canonical);
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

  out = injectMarketingHeadTags(out, pathname, meta, canonicalUrl, canonical || SITE_ORIGIN);
  out = injectAbsoluteFavicons(out, canonical || SITE_ORIGIN);
  out = injectCrawlerSiteNav(out, canonical || SITE_ORIGIN);

  return injectRobotsMeta(out, "index, follow");
}

const SITEMAP_PATHS = MARKETING_NAV_LINKS.map((l) => l.href);

function sitemapPriority(path: string): string {
  if (path === "/") return "1.0";
  if (path === "/preview") return "0.85";
  if (path === "/terms" || path === "/privacy") return "0.5";
  return "0.8";
}

function sitemapChangeFreq(path: string): string {
  if (path === "/terms" || path === "/privacy") return "monthly";
  return "weekly";
}

function buildSitemapXml(base: string): string {
  const origin = normalizePublicOrigin(base);
  const lastMod = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PATHS.map(
    (p) =>
      `  <url>\n    <loc>${escapeAttr(`${origin}${p === "/" ? "/" : p}`)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>${sitemapChangeFreq(p)}</changefreq>\n    <priority>${sitemapPriority(p)}</priority>\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function requestHostname(req: Request): string {
  const rawHost = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  return rawHost.split(",")[0]?.trim().split(":")[0]?.toLowerCase() || "";
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
    const parsed = new URL(`${canonical}/`);
    canonicalHost = parsed.hostname.toLowerCase();
    needHttps = parsed.protocol === "https:";
  } catch {
    next();
    return;
  }

  const host = requestHostname(req);
  if (!host) {
    next();
    return;
  }

  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim().toLowerCase();
  const isTls =
    forwardedProto === "https" || (req.socket as { encrypted?: boolean }).encrypted === true;

  const pathWithQuery = req.originalUrl || "/";

  if (host === `www.${canonicalHost}`) {
    redirect301(res, buildRedirectUrl(pathWithQuery, canonical));
    return;
  }

  if (needHttps && !isTls && host === canonicalHost) {
    redirect301(res, buildRedirectUrl(pathWithQuery, canonical));
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
    const disallow = NON_INDEXABLE_PATH_PREFIXES.map((p) => `Disallow: ${p}`).join("\n");
    const lines = [
      "User-agent: *",
      "Allow: /",
      "Allow: /favicon.ico",
      "Allow: /favicon-48.png",
      "Allow: /favicon-192.png",
      "Allow: /site.webmanifest",
      "",
      "User-agent: Googlebot-Image",
      "Allow: /favicon.ico",
      "Allow: /favicon-48.png",
      "Allow: /favicon-192.png",
      "",
      disallow,
      "",
      `Sitemap: ${normalizePublicOrigin(base)}/sitemap.xml`,
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
