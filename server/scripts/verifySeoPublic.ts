import assert from "node:assert/strict";
import {
  getCanonicalOrigin,
  getCanonicalOriginForHost,
  getSpecialtyForHost,
  injectSpaIndexHtml,
  isMarketingIndexablePath,
  isNonIndexableAppPath,
  normalizePublicOrigin,
  stripDefaultPortFromUrl,
} from "../seoPublic";

const shell = `<!doctype html><html><head><title>Atlas Review</title>
<meta name="description" content="generic" />
<meta property="og:title" content="old" />
</head><body></body></html>`;

process.env.NODE_ENV = "production";
delete process.env.CANONICAL_PUBLIC_ORIGIN;

assert.equal(normalizePublicOrigin("https://prs-atlas.com:443"), "https://prs-atlas.com");
assert.equal(
  stripDefaultPortFromUrl("https://prs-atlas.com:443/about"),
  "https://prs-atlas.com/about",
);
assert.equal(getCanonicalOrigin(), "https://prs-atlas.com");

const home = injectSpaIndexHtml(shell, "/");
assert.match(home, /<title>Plastic Surgery Board Prep/);
assert.match(home, /rel="canonical" href="https:\/\/prs-atlas\.com\/"/);
assert.match(home, /content="index, follow"/);
assert.match(home, /name="keywords"/);
assert.match(home, /id="atlas-structured-data"/);
assert.match(home, /href="https:\/\/prs-atlas\.com\/favicon-48\.png\?v=/);
assert.match(home, /id="seo-crawler-nav"/);
assert.match(home, /href="https:\/\/prs-atlas\.com\/pricing"/);
assert.doesNotMatch(home, /"FAQPage"/);

const pricing = injectSpaIndexHtml(shell, "/pricing");
assert.match(pricing, /"FAQPage"/);

const preview = injectSpaIndexHtml(shell, "/preview");
assert.match(preview, /rel="canonical" href="https:\/\/prs-atlas\.com\/preview"/);
assert.match(preview, /Free Plastic Surgery Board Q&A Preview|Plastic Surgery Board Q&A Preview/);

const login = injectSpaIndexHtml(shell, "/login");
assert.match(login, /content="noindex, nofollow"/);
assert.doesNotMatch(login, /rel="canonical"/);

assert.equal(isMarketingIndexablePath("/pricing"), true);
assert.equal(isNonIndexableAppPath("/admin/generated-questions"), true);

assert.equal(getSpecialtyForHost("prs-atlas.com"), "prs");
assert.equal(getSpecialtyForHost("ortho-atlas.com"), "ortho");
assert.equal(getSpecialtyForHost("www.ortho-atlas.com"), "ortho");
assert.equal(getCanonicalOriginForHost("ortho-atlas.com"), "https://ortho-atlas.com");

const prsHome = injectSpaIndexHtml(shell, "/", "prs-atlas.com");
assert.match(prsHome, /data-specialty="prs"/);
assert.match(prsHome, /<title>Plastic Surgery Board Prep/);

const orthoHome = injectSpaIndexHtml(shell, "/", "ortho-atlas.com");
assert.match(orthoHome, /data-specialty="ortho"/);
assert.match(orthoHome, /<title>Orthopaedic Surgery Board Prep/);
assert.match(orthoHome, /rel="canonical" href="https:\/\/ortho-atlas\.com\/"/);
assert.match(orthoHome, /href="https:\/\/ortho-atlas\.com\/favicon-48\.png\?v=/);
assert.match(orthoHome, /Ortho Atlas/);
assert.doesNotMatch(orthoHome, /prs-atlas\.com/);

/** Known specialty hosts must win over a single-origin override. */
process.env.CANONICAL_PUBLIC_ORIGIN = "https://prs-atlas.com:443";
const about = injectSpaIndexHtml(shell, "/about");
assert.match(about, /rel="canonical" href="https:\/\/prs-atlas\.com\/about"/);
assert.equal(getCanonicalOriginForHost("ortho-atlas.com"), "https://ortho-atlas.com");

console.log("verifySeoPublic: ok");
