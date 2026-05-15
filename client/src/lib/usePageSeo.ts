import { useEffect } from "react";
import { getPublicPageSeo, SITE_ORIGIN } from "@shared/publicPageSeo";
import { getStructuredData } from "@shared/seoStructuredData";

function upsertMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Syncs document head for marketing routes after SPA navigation (must match server injectSpaIndexHtml).
 */
export function usePageSeo(marketingPath: string) {
  useEffect(() => {
    const meta = getPublicPageSeo(marketingPath);
    if (!meta) return;

    const ogTitle = meta.ogTitle ?? meta.title;
    const ogDescription = meta.ogDescription ?? meta.description;
    const pathSeg = marketingPath === "/" ? "/" : marketingPath;
    const canonicalUrl = new URL(pathSeg, `${SITE_ORIGIN}/`).href;
    const ogImage = `${SITE_ORIGIN}/atlas-logo.png`;

    document.title = meta.title;
    upsertMetaName("description", meta.description);
    upsertMetaName("keywords", meta.keywords);
    upsertMetaName("robots", "index, follow");

    upsertMetaProperty("og:title", ogTitle);
    upsertMetaProperty("og:description", ogDescription);
    upsertMetaProperty("og:url", canonicalUrl);
    upsertMetaProperty("og:type", "website");
    upsertMetaProperty("og:image", ogImage);
    upsertMetaProperty("og:site_name", "Atlas Review");
    upsertMetaProperty("og:locale", "en_US");

    upsertMetaName("twitter:card", "summary_large_image");
    upsertMetaName("twitter:title", ogTitle);
    upsertMetaName("twitter:description", ogDescription);
    upsertMetaName("twitter:image", ogImage);

    upsertCanonical(canonicalUrl);

    const structured = getStructuredData(marketingPath, SITE_ORIGIN);
    if (structured) {
      const raw = JSON.stringify(structured).replace(/</g, "\\u003c");
      let script = document.getElementById("atlas-structured-data");
      if (!script) {
        script = document.createElement("script");
        script.id = "atlas-structured-data";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = raw;
    }
  }, [marketingPath]);
}
