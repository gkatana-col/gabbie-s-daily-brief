import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { GreetingCard, DailySummaryCard, PriorityCard, CalendarCard, WeatherCard, NewsCard, InsightCard, EveningRecapCard } from "@/components/briefing/BriefingCards";
import { mockRawBriefingData } from "@/features/briefing/mockData";
import { generateBriefing } from "@/features/briefing/briefingEngine";
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
  const { user, language } = useApp();
  const briefing = useMemo(() => generateBriefing(mockRawBriefingData, user, language), [user, language]);
  return <div className="space-y-5"><GreetingCard briefing={briefing} /><DailySummaryCard briefing={briefing} /><div className="grid gap-5 md:grid-cols-2"><PriorityCard briefing={briefing} /><CalendarCard briefing={briefing} /><WeatherCard briefing={briefing} /><InsightCard briefing={briefing} /></div><NewsCard briefing={briefing} /><EveningRecapCard briefing={briefing} /></div>;
}
