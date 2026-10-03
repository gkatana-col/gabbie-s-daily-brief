import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { NewsCard } from "@/components/briefing/BriefingCards";
import { generateBriefing } from "@/features/briefing/briefingEngine";
import { mockRawBriefingData } from "@/features/briefing/mockData";
import { useApp } from "@/features/i18n/I18nProvider";
import { PageHeader } from "./today";
export const Route = createFileRoute("/news")({ component: NewsPage, head: () => ({ meta: [{ title: "Новини — Brief" }, { name: "description", content: "Кратка персонална селекция от важните новини." }, { property: "og:title", content: "Новини — Brief" }, { property: "og:description", content: "Подбрани новини без излишен шум." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }) });
function NewsPage() { const { user, language, t } = useApp(); const briefing = useMemo(() => generateBriefing(mockRawBriefingData, user, language), [user, language]); return <div><PageHeader title={t("newsTitle")} subtitle={t("newsSubtitle")} /><NewsCard briefing={briefing} expanded /></div>; }
