import type { Briefing, ResolvedLanguage } from "@/features/briefing/types";
import type { BriefingPeriod } from "@/features/briefing/briefingScheduler";
import type { NowBarContent } from "./types";

const copy = {
  bg: { morningTitle: "Добро утро", morningSub: "Твоят ден", important: (n: number) => `${n} ${n === 1 ? "важно нещо" : "важни неща"} днес`, next: "Следващо събитие", inMin: (m: number) => `След ${m} мин`, eveningTitle: "Вечерен обзор", eveningSub: "Как мина денят?", general: "Brief" },
  en: { morningTitle: "Good morning", morningSub: "Your day", important: (n: number) => `${n} important ${n === 1 ? "thing" : "things"} today`, next: "Next event", inMin: (m: number) => `In ${m} min`, eveningTitle: "Evening recap", eveningSub: "How did your day go?", general: "Brief" },
} as const;

/** Pure mapping from the briefing engine output to a Now Bar state. Uses only facts in the briefing. */
export function briefingToNowBarContent(briefing: Briefing, period: BriefingPeriod, language: ResolvedLanguage, now: Date, upcomingWindowMin = 60): NowBarContent {
  const c = copy[language];
  const action = { type: "open_brief" as const, target: briefing.type };
  const next = briefing.calendar.map((e) => ({ e, min: Math.round((new Date(e.start).getTime() - now.getTime()) / 60000) })).filter((x) => x.min > 0 && x.min <= upcomingWindowMin).sort((a, b) => a.min - b.min)[0];
  if (next && period !== "inactive") {
    return { id: `calendar:${next.e.id}`, type: "calendar", title: c.next, subtitle: `${next.e.title} · ${c.inMin(next.min)}`, icon: "calendar", timestamp: next.e.start, priority: next.e.importance === "critical" || next.e.importance === "high" ? "high" : "normal", action: { type: "open_screen", target: "calendar" }, expandable: true };
  }
  if (period === "evening" || briefing.type === "evening") {
    return { id: `evening:${briefing.generatedAt.slice(0, 10)}`, type: "evening", title: c.eveningTitle, subtitle: c.eveningSub, icon: "evening", timestamp: briefing.generatedAt, priority: "normal", action, expandable: true };
  }
  if (period === "morning") {
    const count = briefing.priorities.filter((p) => !p.completed).length;
    return { id: `morning:${briefing.generatedAt.slice(0, 10)}`, type: "morning", title: c.morningTitle, subtitle: count ? `${c.morningSub} · ${c.important(count)}` : c.morningSub, icon: "morning", timestamp: briefing.generatedAt, priority: "normal", action, expandable: true };
  }
  return { id: "general", type: "general", title: c.general, icon: "brand", priority: "low", action: { type: "open_brief" } };
}
