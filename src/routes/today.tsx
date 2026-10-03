import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarCard, DailySummaryCard, PriorityCard, InsightCard } from "@/components/briefing/BriefingCards";
import { generateBriefing } from "@/features/briefing/briefingEngine";
import { mockRawBriefingData } from "@/features/briefing/mockData";
import { useApp } from "@/features/i18n/I18nProvider";

export const Route = createFileRoute("/today")({ component: TodayPage, head: () => ({ meta: [{ title: "Днес — Brief" }, { name: "description", content: "Приоритети, срещи и фокус за днешния ден." }, { property: "og:title", content: "Днес — Brief" }, { property: "og:description", content: "Твоят спокоен и подреден план за деня." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }) });
function TodayPage() { const { user, language, t } = useApp(); const briefing = useMemo(() => generateBriefing(mockRawBriefingData, user, language), [user, language]); return <div><PageHeader title={t("todayTitle")} subtitle={t("todaySubtitle")} /><div className="space-y-5"><DailySummaryCard briefing={briefing} /><div className="grid gap-5 md:grid-cols-2"><PriorityCard briefing={briefing} /><CalendarCard briefing={briefing} expanded /></div><InsightCard briefing={briefing} /></div></div>; }
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) { return <header className="mb-7 pt-3"><p className="mb-2 text-xs font-semibold uppercase text-primary">Brief</p><h1 className="font-display text-3xl font-semibold">{title}</h1><p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p></header>; }
