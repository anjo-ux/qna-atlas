/** Shared rules for Slack growth notifications (signup / purchase / upgrade). */

export function classifyPlanEvent(
  previousPlanName?: string | null,
  previousStatus?: string | null,
  newPlanName?: string | null,
): "purchased" | "upgraded" {
  const prev = previousPlanName?.trim() || "";
  const next = newPlanName?.trim() || "";
  const status = (previousStatus || "").toLowerCase();
  const hadLivePersonalPlan =
    Boolean(prev) &&
    prev !== "institutional" &&
    (status === "active" || status === "trial");
  if (hadLivePersonalPlan && next && prev !== next) return "upgraded";
  return "purchased";
}
