import { createFileRoute } from "@tanstack/react-router";
import { CalendarCard, WeatherCard } from "@/components/briefing/BriefingCards";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { PageHeader } from "./today";
export const Route = createFileRoute("/calendar")({ component: CalendarPage, head: () => ({ meta: [{ title: "Календар — Brief" }, { name: "description", content: "Ясен преглед на срещите и времето ти." }, { property: "og:title", content: "Календар — Brief" }, { property: "og:description", content: "Времето ти, подредено спокойно и ясно." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }) });
function CalendarPage() { const { briefingType, t } = useApp(); const briefing = useBriefing(briefingType); return <div><PageHeader title={t("calendarTitle")} subtitle={t("calendarSubtitle")} /><div className="grid gap-5 md:grid-cols-[1.5fr_1fr]"><CalendarCard briefing={briefing} expanded /><WeatherCard briefing={briefing} /></div></div>; }
