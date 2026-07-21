import { ORAL_BOARDS_MARKETING_FAQ, PRICING_MARKETING_FAQ } from "./marketingFaqs";
import type { PublicPageSeo } from "./publicPageSeo";
import { PUBLIC_PAGE_SEO, SITE_ORIGIN } from "./publicPageSeo";

function normalizePath(pathname: string): string {
  const p = pathname.split("?")[0]?.split("#")[0] || "/";
  if (p === "" || p === "/") return "/";
  return p.endsWith("/") ? p.slice(0, -1) || "/" : p;
}

function pageUrl(pathname: string, origin: string): string {
  if (pathname === "/") return `${origin}/`;
  return `${origin}${pathname}`;
}

function organizationAndWebSite(meta: PublicPageSeo, origin: string): Record<string, unknown>[] {
  return [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "PRS Atlas, LLC",
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: `${origin}/favicon-192.png?v=20260721d`,
        width: 192,
        height: 192,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: origin,
      name: "Atlas Review",
      alternateName: "Plastic Surgery Atlas Review",
      description: meta.description,
      publisher: { "@id": `${origin}/#organization` },
      inLanguage: "en-US",
    },
  ];
}

function webPageJson(pathname: string, meta: PublicPageSeo, origin: string): Record<string, unknown> {
  const url = pageUrl(pathname, origin);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": `${origin}/#website` },
    inLanguage: "en-US",
  };
}

function faqJsonLd(pathname: string, origin: string): Record<string, unknown> | null {
  const faqs =
    pathname === "/pricing"
      ? PRICING_MARKETING_FAQ
      : pathname === "/oral-boards-coach"
        ? ORAL_BOARDS_MARKETING_FAQ
        : null;
  if (!faqs) return null;
  const url = pageUrl(pathname, origin);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/**
 * JSON-LD for marketing routes. Used by server HTML injection and client usePageSeo.
 */
export function getStructuredData(
  pathname: string,
  origin: string = SITE_ORIGIN,
): Record<string, unknown> | null {
  const n = normalizePath(pathname);
  const meta = PUBLIC_PAGE_SEO[n];
  if (!meta) return null;

  if (n === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": organizationAndWebSite(meta, origin),
    };
  }

  const graph: Record<string, unknown>[] = [
    ...organizationAndWebSite(PUBLIC_PAGE_SEO["/"]!, origin),
    webPageJson(n, meta, origin),
  ];

  const faq = faqJsonLd(n, origin);
  if (faq) graph.push(faq);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
