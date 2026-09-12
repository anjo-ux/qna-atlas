import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterTooEasyQuestions,
  formatCorrectPct,
  truncateForSlack,
} from "./tooEasyQuestionsLogic";

describe("filterTooEasyQuestions", () => {
  it("keeps ≥90% correct above the min sample", () => {
    const out = filterTooEasyQuestions(
      [
        {
          questionId: "q1",
          subsectionId: "s1",
          answered: 20,
          uniqueUsers: 15,
          incorrect: 2, // 90%
        },
        {
          questionId: "q2",
          subsectionId: "s1",
          answered: 20,
          uniqueUsers: 15,
          incorrect: 3, // 85%
        },
        {
          questionId: "q3",
          subsectionId: "s1",
          answered: 5,
          uniqueUsers: 5,
          incorrect: 0,
        },
      ],
      10,
      0.9
    );
    assert.equal(out.length, 1);
    assert.equal(out[0].questionId, "q1");
    assert.equal(out[0].correctRate, 0.9);
  });

  it("includes 100% correct", () => {
    const out = filterTooEasyQuestions(
      [
        {
          questionId: "perfect",
          subsectionId: "s1",
          answered: 12,
          uniqueUsers: 8,
          incorrect: 0,
        },
      ],
      10,
      0.9
    );
    assert.equal(out.length, 1);
    assert.equal(out[0].correctRate, 1);
  });

  it("sorts by correct rate then volume", () => {
    const out = filterTooEasyQuestions(
      [
        {
          questionId: "lower",
          subsectionId: "s1",
          answered: 40,
          uniqueUsers: 20,
          incorrect: 4, // 90%
        },
        {
          questionId: "higher",
          subsectionId: "s1",
          answered: 10,
          uniqueUsers: 9,
          incorrect: 0, // 100%
        },
      ],
      10,
      0.9
    );
    assert.equal(out[0].questionId, "higher");
    assert.equal(out[1].questionId, "lower");
  });
});

describe("formatCorrectPct", () => {
  it("formats rates", () => {
    assert.equal(formatCorrectPct(0.9), "90%");
    assert.equal(formatCorrectPct(1), "100%");
  });
});

describe("truncateForSlack", () => {
  it("shortens long text", () => {
    assert.equal(truncateForSlack("abcdef", 4), "abc…");
  });
});
