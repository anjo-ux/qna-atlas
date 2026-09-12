import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyPlanEvent } from "./notifyGrowthLogic";

describe("classifyPlanEvent", () => {
  it("treats a first paid plan as a purchase", () => {
    assert.equal(classifyPlanEvent(null, "expired", "6-month"), "purchased");
    assert.equal(classifyPlanEvent(undefined, undefined, "1-year"), "purchased");
  });

  it("treats institutional or expired history as a purchase", () => {
    assert.equal(classifyPlanEvent("institutional", "active", "monthly"), "purchased");
    assert.equal(classifyPlanEvent("monthly", "expired", "1-year"), "purchased");
  });

  it("treats an active or trial plan switch as an upgrade", () => {
    assert.equal(classifyPlanEvent("monthly", "active", "6-month"), "upgraded");
    assert.equal(classifyPlanEvent("6-month", "trial", "1-year"), "upgraded");
  });

  it("does not treat a same-plan repurchase as an upgrade", () => {
    assert.equal(classifyPlanEvent("1-year", "active", "1-year"), "purchased");
  });
});
