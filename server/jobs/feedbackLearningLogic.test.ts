import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractQuestionIdsFromText,
  looksLikeMissingMedia,
  parseAgentDecision,
  rankCandidates,
  truncateForSlack,
} from "./feedbackLearningLogic";

describe("looksLikeMissingMedia", () => {
  it("detects missing photo/imaging reports", () => {
    assert.equal(looksLikeMissingMedia("The photo is missing"), true);
    assert.equal(looksLikeMissingMedia("imaging is missing from this question"), true);
    assert.equal(looksLikeMissingMedia("can't see the figure"), true);
    assert.equal(looksLikeMissingMedia("wrong answer key should be B"), false);
  });
});

describe("parseAgentDecision", () => {
  it("parses fenced JSON", () => {
    const d = parseAgentDecision('```json\n{"action":"revise","reason":"typo","revisedQuestion":"Q","revisedAnswer":"A)"}\n```');
    assert.equal(d?.action, "revise");
    assert.equal(d?.revisedQuestion, "Q");
  });
  it("rejects unknown actions", () => {
    assert.equal(parseAgentDecision('{"action":"explode","reason":"no"}'), null);
  });
  it("parses needs_manual", () => {
    const d = parseAgentDecision('{"action":"needs_manual","reason":"missing photo"}');
    assert.equal(d?.action, "needs_manual");
  });
});

describe("rankCandidates", () => {
  const t = new Date();
  it("includes two reports", () => {
    const ranked = rankCandidates({
      reports: [
        { id: "1", questionId: "q1", message: "typo in stem", createdAt: t },
        { id: "2", questionId: "q1", message: "still a typo", createdAt: t },
      ],
      missRates: [],
      contactQuestionIds: [],
      lastRevisionAtByQuestionId: new Map(),
    });
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0].questionId, "q1");
  });
  it("includes a single missing-media report", () => {
    const ranked = rankCandidates({
      reports: [{ id: "1", questionId: "q2", message: "photo is missing", createdAt: t }],
      missRates: [],
      contactQuestionIds: [],
      lastRevisionAtByQuestionId: new Map(),
    });
    assert.equal(ranked.length, 1);
  });
  it("skips a single vague report", () => {
    const ranked = rankCandidates({
      reports: [{ id: "1", questionId: "q3", message: "this is hard", createdAt: t }],
      missRates: [],
      contactQuestionIds: [],
      lastRevisionAtByQuestionId: new Map(),
    });
    assert.equal(ranked.length, 0);
  });
  it("skips if already revised after latest report", () => {
    const ranked = rankCandidates({
      reports: [
        { id: "1", questionId: "q1", message: "typo", createdAt: new Date("2026-01-01") },
        { id: "2", questionId: "q1", message: "typo again", createdAt: new Date("2026-01-02") },
      ],
      missRates: [],
      contactQuestionIds: [],
      lastRevisionAtByQuestionId: new Map([["q1", new Date("2026-01-03")]]),
    });
    assert.equal(ranked.length, 0);
  });
});

describe("extractQuestionIdsFromText", () => {
  it("finds uuids", () => {
    const ids = extractQuestionIdsFromText(
      "See 11111111-1111-1111-1111-111111111111 please",
      new Set()
    );
    assert.equal(ids.includes("11111111-1111-1111-1111-111111111111"), true);
  });
});

describe("truncateForSlack", () => {
  it("shortens long text", () => {
    assert.equal(truncateForSlack("abcd", 3), "ab…");
  });
});
