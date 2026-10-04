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

function interpolateAtmosphere(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const keyframes = [
    { at: 0, values: [0.16, 0.035, 235, 0.34, 0.09, 195, 0.38, 0.09, 220] },
    { at: 300, values: [0.78, 0.025, 220, 0.18, 0.07, 195, 0.98, 0.03, 220] },
    { at: 660, values: [0.94, 0.018, 220, 0.14, 0.05, 190, 0.98, 0.015, 220] },
    { at: 1020, values: [0.86, 0.025, 235, 0.2, 0.08, 315, 0.94, 0.04, 35] },
    { at: 1320, values: [0.18, 0.035, 235, 0.34, 0.1, 325, 0.42, 0.1, 35] },
    { at: 1440, values: [0.16, 0.035, 235, 0.34, 0.09, 195, 0.38, 0.09, 220] },
  ];
  const extendedMinutes = minutes < 300 ? minutes + 1440 : minutes;
  const frames = keyframes.map((frame) => ({ ...frame, at: frame.at < 300 ? frame.at + 1440 : frame.at }));
  const left = frames.find((frame, index) => extendedMinutes >= frame.at && extendedMinutes <= (frames[index + 1]?.at ?? 1440));
  const start = left ?? frames[0];
  const end = frames[frames.indexOf(start) + 1] ?? frames[0];
  const progress = end.at === start.at ? 0 : (extendedMinutes - start.at) / (end.at - start.at);
  const values = start.values.map((value, index) => value + (end.values[index] - value) * progress);
  const [baseL, baseC, baseH, glowL, glowC, glowH, washL, washC, washH] = values;
  return {
    className: minutes >= 300 && minutes < 660 ? "morning" : minutes >= 660 && minutes < 1020 ? "midday" : minutes >= 1020 && minutes < 1320 ? "evening" : "inactive",
    style: {
      "--atmosphere-base": `oklch(${baseL} ${baseC} ${baseH})`,
      "--atmosphere-glow": `oklch(${glowL} ${glowC} ${glowH} / .46)`,
      "--atmosphere-wash": `oklch(${washL} ${washC} ${washH} / .34)`,
    } as React.CSSProperties,
  };
}

function Index() {
  const { briefingType, setBriefingType, t, briefingLanguage } = useApp();
  const briefing = useBriefing(briefingType);
  const nextAlarm = useNextAlarm();
  const [localTime, setLocalTime] = useState(() => new Date());
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const atmosphere = interpolateAtmosphere(localTime);
  const touchStart = useRef<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleBriefing = () => setBriefingType(briefingType === "morning" ? "evening" : "morning");

  useEffect(() => {
    const clock = window.setInterval(() => setLocalTime(new Date()), 60_000);
    return () => window.clearInterval(clock);
  }, []);
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

  return <div className={`brief-flow brief-now-layout brief-time-${briefing.type} brief-atmosphere-${atmosphere.className}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ ...atmosphere.style, "--pull-distance": `${pullDistance}px` } as React.CSSProperties}>
    <div className={`brief-refresh-indicator${isRefreshing ? " is-refreshing" : ""}`} aria-live="polite" aria-hidden={pullDistance === 0 && !isRefreshing}>
      <span className="brief-refresh-glyph" aria-hidden="true"><BriefIcon name="refresh" size={16} /></span>
      <span>{isRefreshing ? "Обновяване" : pullDistance >= 64 ? "Пусни за обновяване" : "Издърпай за обновяване"}</span>
    </div>
    <GreetingCard briefing={briefing} onPillClick={toggleBriefing} />{nextAlarm && <div className="brief-inline-meta" aria-label="Next alarm"><BriefIcon name="morning" size={19} /><div><p className="text-xs font-medium text-muted-foreground">Следваща аларма</p><p className="text-sm font-semibold">{nextAlarm.time}</p></div></div>}{import.meta.env.DEV && <div className="flex justify-end gap-1" aria-label="Brief demo controls"><Button size="sm" variant={briefingType === "morning" ? "secondary" : "ghost"} onClick={() => setBriefingType("morning")}>{t("showMorning")}</Button><Button size="sm" variant={briefingType === "evening" ? "secondary" : "ghost"} onClick={() => setBriefingType("evening")}>{t("showEvening")}</Button></div>}<DailySummaryCard briefing={briefing} /><div className="brief-sections brief-now-sections"><WeatherCard briefing={briefing} /><CalendarCard briefing={briefing} /><PriorityCard briefing={briefing} /><InsightCard briefing={briefing} /></div><NewsCard briefing={briefing} /><EveningRecapCard briefing={briefing} /></div>;
}
