import { createFileRoute } from "@tanstack/react-router";
import { GreetingCard, DailySummaryCard, PriorityCard, CalendarCard, WeatherCard, NewsCard, InsightCard, EveningRecapCard } from "@/components/briefing/BriefingCards";
import { Button } from "@/components/ui/button";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { useNextAlarm } from "@/features/native/useNextAlarm";
import { BriefIcon } from "@/components/BriefIcon";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({ meta: [
    { title: "Brief — Твоят личен дневен обзор" },
    { name: "description", content: "Спокоен, интелигентен дневен обзор с приоритети, календар, време и новини." },
    { property: "og:title", content: "Brief — Твоят личен дневен обзор" },
    { property: "og:description", content: "Всичко важно за деня, събрано на едно спокойно място." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
});

function Index() {
  const { briefingType, setBriefingType, t } = useApp();
  const briefing = useBriefing(briefingType);
  const nextAlarm = useNextAlarm();
  const toggleBriefing = () => setBriefingType(briefingType === "morning" ? "evening" : "morning");
  return <div className={`brief-flow brief-now-layout brief-time-${briefing.type}`}><GreetingCard briefing={briefing} onPillClick={toggleBriefing} />{nextAlarm && <div className="brief-inline-meta" aria-label="Next alarm"><BriefIcon name="morning" size={19} /><div><p className="text-xs font-medium text-muted-foreground">Следваща аларма</p><p className="text-sm font-semibold">{nextAlarm.time}</p></div></div>}{import.meta.env.DEV && <div className="flex justify-end gap-1" aria-label="Brief demo controls"><Button size="sm" variant={briefingType === "morning" ? "secondary" : "ghost"} onClick={() => setBriefingType("morning")}>{t("showMorning")}</Button><Button size="sm" variant={briefingType === "evening" ? "secondary" : "ghost"} onClick={() => setBriefingType("evening")}>{t("showEvening")}</Button></div>}<DailySummaryCard briefing={briefing} /><div className="brief-sections brief-now-sections"><WeatherCard briefing={briefing} /><CalendarCard briefing={briefing} /><PriorityCard briefing={briefing} /><InsightCard briefing={briefing} /></div><NewsCard briefing={briefing} /><EveningRecapCard briefing={briefing} /></div>;
}
