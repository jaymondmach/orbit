export type PlanTier = "free" | "pro";

export function getEntitlements(plan?: string | null) {
  const tier: PlanTier = plan === "pro" ? "pro" : "free";

  return tier === "pro"
    ? {
        plan: "pro" as const,
        maxPlans: 25,
        aiGenerationsPerMonth: 250,
        weeklyActionPacks: true,
        calendarExport: true,
      }
    : {
        plan: "free" as const,
        maxPlans: 2,
        aiGenerationsPerMonth: 10,
        weeklyActionPacks: false,
        calendarExport: false,
      };
}
