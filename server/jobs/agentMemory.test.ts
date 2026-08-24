import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatMemoryBlock,
  lessonFingerprint,
  parseLessonDrafts,
} from "./agentMemory";

describe("parseLessonDrafts", () => {
  it("parses a JSON array of lessons", () => {
    const drafts = parseLessonDrafts(
      '```json\n[{"category":"media","lesson":"Never write a stem that depends on a missing photo."}]\n```'
    );
    assert.equal(drafts.length, 1);
    assert.equal(drafts[0].category, "media");
  });
  it("drops tiny fragments", () => {
    assert.equal(parseLessonDrafts('[{"category":"x","lesson":"too short"}]').length, 0);
  });
});

describe("lessonFingerprint", () => {
  it("is stable for whitespace", () => {
    assert.equal(lessonFingerprint("Hello World"), lessonFingerprint("hello   world"));
  });
});

describe("formatMemoryBlock", () => {
  it("returns empty when no lessons", () => {
    assert.equal(formatMemoryBlock([]), "");
  });
  it("lists lessons", () => {
    const block = formatMemoryBlock([{ category: "keying", lesson: "Do not change the keyed letter without explicit evidence in the reports." }]);
    assert.match(block, /Persistent editorial memory/);
    assert.match(block, /\[keying\]/);
  });
});
