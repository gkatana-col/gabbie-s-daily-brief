import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BriefHomeWidget } from "@/components/widget/BriefHomeWidget";
import { Button } from "@/components/ui/button";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { briefingWidgetDataProvider } from "@/features/widget/BriefWidgetDataProvider";
import type { BriefWidgetMode, BriefWidgetSize } from "@/features/widget/types";

export const Route = createFileRoute("/widget-preview")({
  component: WidgetPreviewPage,
  head: () => ({ meta: [
    { title: "Home Screen Widget Preview — Brief" },
    { name: "description", content: "Development preview for the reusable Brief home-screen widget." },
    { property: "og:title", content: "Home Screen Widget Preview — Brief" },
    { property: "og:description", content: "Preview Brief’s morning, evening, and compact widget states." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});

const previews: ReadonlyArray<{ mode: BriefWidgetMode; size: BriefWidgetSize }> = [
  { mode: "morning", size: "4x2" },
  { mode: "evening", size: "4x1" },
  { mode: "inactive", size: "compact" },
];

function WidgetPreviewPage() {
  const { briefingLanguage, setBriefingType, t } = useApp();
  const [selection, setSelection] = useState(0);
  const navigate = useNavigate();
  const current = previews[selection] ?? previews[0];
  const mode = current?.mode ?? "morning";
  const size = current?.size ?? "4x2";
  const briefing = useBriefing(mode === "evening" ? "evening" : "morning");
  const data = useMemo(() => briefingWidgetDataProvider.getData(mode, briefing, briefingLanguage), [briefing, briefingLanguage, mode]);
  const activate = () => {
    if (mode !== "inactive") setBriefingType(mode);
    void navigate({ to: "/" });
  };

  return <div>
    <header className="mb-6 pt-3"><p className="mb-2 text-xs font-semibold uppercase text-primary">Brief</p><h1 className="font-display text-3xl font-semibold">{t("widgetPreviewTitle")}</h1><p className="mt-2 text-[15px] text-muted-foreground">{t("widgetPreviewSubtitle")}</p></header>
    <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-secondary/70 p-1" aria-label={t("widgetPreviewModes")}>
      {[t("widgetMorning"), t("widgetEvening"), t("widgetCompact")].map((label, index) => <Button key={label} variant={selection === index ? "outline" : "ghost"} className="min-w-0 px-2" onClick={() => setSelection(index)}>{label}</Button>)}
    </div>
    <section className="android-preview" aria-label={t("widgetPreviewTitle")}>
      <div className="android-status"><span>14:50</span><span>LTE&nbsp;&nbsp;86%</span></div>
      <div className="android-date"><p>{t("widgetPreviewDay")}</p><p>{t("widgetPreviewDate")}</p></div>
      <div className={size === "compact" ? "flex justify-start" : "w-full"}>
        <BriefHomeWidget data={data} size={size} onActivate={activate} openLabel={t("widgetOpenBrief")} />
      </div>
      <p className="android-preview-note">{size === "4x2" ? "4 × 2" : size === "4x1" ? "4 × 1" : t("widgetCompact")}</p>
    </section>
  </div>;
}