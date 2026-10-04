import { createFileRoute } from "@tanstack/react-router";
import { GreetingCard, DailySummaryCard, PriorityCard, CalendarCard, WeatherCard, NewsCard, InsightCard, EveningRecapCard } from "@/components/briefing/BriefingCards";
import { Button } from "@/components/ui/button";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";

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
  const toggleBriefing = () => setBriefingType(briefingType === "morning" ? "evening" : "morning");
  return <div className="brief-page"><GreetingCard briefing={briefing} onPillClick={toggleBriefing} />{import.meta.env.DEV && <div className="brief-demo-controls" aria-label="Brief demo controls"><Button size="sm" variant={briefingType === "morning" ? "secondary" : "ghost"} onClick={() => setBriefingType("morning")}>{t("showMorning")}</Button><Button size="sm" variant={briefingType === "evening" ? "secondary" : "ghost"} onClick={() => setBriefingType("evening")}>{t("showEvening")}</Button></div>}<DailySummaryCard briefing={briefing} /><div className="brief-grid"><PriorityCard briefing={briefing} /><CalendarCard briefing={briefing} /><WeatherCard briefing={briefing} /><InsightCard briefing={briefing} /></div><NewsCard briefing={briefing} expanded /><EveningRecapCard briefing={briefing} /></div>;
}
