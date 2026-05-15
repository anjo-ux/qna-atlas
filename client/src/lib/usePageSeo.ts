import { useEffect } from "react";

/** Sets document title, meta description, and optional robots for SPA SEO. */
export function usePageSeo(opts: {
  title: string;
  description: string;
  robots?: "index, follow" | "noindex, nofollow";
}) {
  useEffect(() => {
    document.title = opts.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", opts.description);

    if (opts.robots) {
      let robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", opts.robots);
    }
  }, [opts.title, opts.description, opts.robots]);
}
