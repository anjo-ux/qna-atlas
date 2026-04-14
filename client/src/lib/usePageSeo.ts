import { useEffect } from "react";

/** Sets document title and meta description for SPA SEO (no extra dependencies). */
export function usePageSeo(opts: { title: string; description: string }) {
  useEffect(() => {
    document.title = opts.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", opts.description);
  }, [opts.title, opts.description]);
}
