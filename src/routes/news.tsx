import { createFileRoute } from "@tanstack/react-router";
import { NewsCard } from "@/components/briefing/BriefingCards";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { PageHeader } from "./today";
export const Route = createFileRoute("/news")({ component: NewsPage, head: () => ({ meta: [{ title: "Новини — Brief" }, { name: "description", content: "Кратка персонална селекция от важните новини." }, { property: "og:title", content: "Новини — Brief" }, { property: "og:description", content: "Подбрани новини без излишен шум." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }) });
function NewsPage() { const { briefingType, t } = useApp(); const briefing = useBriefing(briefingType); return <div><PageHeader title={t("newsTitle")} subtitle={t("newsSubtitle")} /><NewsCard briefing={briefing} expanded /></div>; }
