import assert from "node:assert/strict";
import {
  getCanonicalOrigin,
  injectSpaIndexHtml,
  isMarketingIndexablePath,
  isNonIndexableAppPath,
  normalizePublicOrigin,
} from "../seoPublic";

const shell = `<!doctype html><html><head><title>Atlas Review</title>
<meta name="description" content="generic" /></head><body></body></html>`;

process.env.NODE_ENV = "production";
delete process.env.CANONICAL_PUBLIC_ORIGIN;

assert.equal(normalizePublicOrigin("https://prs-atlas.com:443"), "https://prs-atlas.com");
assert.equal(getCanonicalOrigin(), "https://prs-atlas.com");

const home = injectSpaIndexHtml(shell, "/");
assert.match(home, /<title>Plastic Surgery Atlas Review/);
assert.match(home, /rel="canonical" href="https:\/\/prs-atlas\.com\/"/);
assert.match(home, /content="index, follow"/);

const login = injectSpaIndexHtml(shell, "/login");
assert.match(login, /content="noindex, nofollow"/);
assert.doesNotMatch(login, /rel="canonical"/);

assert.equal(isMarketingIndexablePath("/pricing"), true);
assert.equal(isNonIndexableAppPath("/admin/generated-questions"), true);

process.env.CANONICAL_PUBLIC_ORIGIN = "https://prs-atlas.com:443";
const about = injectSpaIndexHtml(shell, "/about");
assert.match(about, /rel="canonical" href="https:\/\/prs-atlas\.com\/about"/);

console.log("verifySeoPublic: ok");
