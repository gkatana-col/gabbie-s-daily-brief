import { createFileRoute } from "@tanstack/react-router";
import { GreetingCard, DailySummaryCard, PriorityCard, CalendarCard, WeatherCard, NewsCard, InsightCard, EveningRecapCard } from "@/components/briefing/BriefingCards";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { refreshWeather } from "@/features/weather/weatherService";
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
  const { briefingType, setBriefingType, t, briefingLanguage } = useApp();
  const briefing = useBriefing(briefingType);
  const nextAlarm = useNextAlarm();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStart = useRef<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleBriefing = () => setBriefingType(briefingType === "morning" ? "evening" : "morning");

  useEffect(() => () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); }, []);

  const finishRefresh = () => {
    setIsRefreshing(true);
    void refreshWeather(briefingLanguage).finally(() => {
      refreshTimer.current = setTimeout(() => setIsRefreshing(false), 360);
    });
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY <= 2 && !isRefreshing) touchStart.current = event.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;
    const distance = Math.max(0, Math.min(92, (event.touches[0]?.clientY ?? 0) - touchStart.current));
    if (distance > 0) event.preventDefault();
    setPullDistance(distance);
  };
  const onTouchEnd = () => {
    if (pullDistance >= 64) finishRefresh();
    touchStart.current = null;
    setPullDistance(0);
  };

  return <div className={`brief-flow brief-now-layout brief-time-${briefing.type}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ "--pull-distance": `${pullDistance}px` } as React.CSSProperties}>
    <div className={`brief-refresh-indicator${isRefreshing ? " is-refreshing" : ""}`} aria-live="polite" aria-hidden={pullDistance === 0 && !isRefreshing}>
      <span className="brief-refresh-glyph" aria-hidden="true"><BriefIcon name="refresh" size={16} /></span>
      <span>{isRefreshing ? "Обновяване" : pullDistance >= 64 ? "Пусни за обновяване" : "Издърпай за обновяване"}</span>
    </div>
    <GreetingCard briefing={briefing} onPillClick={toggleBriefing} />{nextAlarm && <div className="brief-inline-meta" aria-label="Next alarm"><BriefIcon name="morning" size={19} /><div><p className="text-xs font-medium text-muted-foreground">Следваща аларма</p><p className="text-sm font-semibold">{nextAlarm.time}</p></div></div>}{import.meta.env.DEV && <div className="flex justify-end gap-1" aria-label="Brief demo controls"><Button size="sm" variant={briefingType === "morning" ? "secondary" : "ghost"} onClick={() => setBriefingType("morning")}>{t("showMorning")}</Button><Button size="sm" variant={briefingType === "evening" ? "secondary" : "ghost"} onClick={() => setBriefingType("evening")}>{t("showEvening")}</Button></div>}<DailySummaryCard briefing={briefing} /><div className="brief-sections brief-now-sections"><WeatherCard briefing={briefing} /><CalendarCard briefing={briefing} /><PriorityCard briefing={briefing} /><InsightCard briefing={briefing} /></div><NewsCard briefing={briefing} /><EveningRecapCard briefing={briefing} /></div>;
}
