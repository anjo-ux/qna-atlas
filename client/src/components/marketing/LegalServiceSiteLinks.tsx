import { SPECIALTY_LIST } from "@shared/specialties";

const LINK_CLASS = "font-medium text-primary underline-offset-4 hover:underline";

/** Linked canonical origins for every specialty site this Agreement / Policy covers. */
export function LegalServiceSiteLinks() {
  const urls = SPECIALTY_LIST.map((s) => s.canonicalOrigin);
  return (
    <>
      {urls.map((url, index) => (
        <span key={url}>
          {index > 0 ? (index === urls.length - 1 ? " and " : ", ") : null}
          <a href={url} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </span>
      ))}
    </>
  );
}
