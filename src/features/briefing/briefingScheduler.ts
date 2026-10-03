/** Single time-of-day rule for which briefing period is active. Shared by the widget and Now Bar mapping. */
export type BriefingPeriod = "morning" | "evening" | "inactive";

export function resolveBriefingPeriod(date: Date): BriefingPeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 17) return "morning";
  if (hour >= 17 && hour < 23) return "evening";
  return "inactive";
}
