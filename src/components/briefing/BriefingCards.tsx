import { useSyncExternalStore } from "react";
import { getWeatherState, refreshWeather, subscribeWeather } from "@/features/weather/weatherService";
import type { Briefing } from "@/features/briefing/types";
import { useApp } from "@/features/i18n/I18nProvider";
import { useNativeCalendarEvents } from "@/features/native/useNativeCalendar";
import { BriefIcon, type BriefIconName } from "@/components/BriefIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("brief-card", className)}>{children}</section>;
}
function CardHeading({ icon, title, action }: { icon: BriefIconName; title: string; action?: string | undefined }) {
  return <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="icon-well"><BriefIcon name={icon} /></span><h2 className="truncate font-display text-[15px] font-semibold">{title}</h2></div>{action && <span className="text-xs font-medium text-muted-foreground">{action}</span>}</div>;
}

export function GreetingCard({ briefing, onPillClick }: { briefing: Briefing; onPillClick: () => void }) {
  const { t, language } = useApp();
  const date = new Intl.DateTimeFormat(language === "bg" ? "bg-BG" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(briefing.generatedAt));
  const periodIcon = briefing.type === "morning" ? "morning" : "evening";
  const weatherContext = briefing.weather.available ? `${briefing.weather.temperature}° · ${briefing.weather.location}` : null;
  return <section className="brief-hero relative overflow-hidden pt-2"><div className="brief-hero-top"><div><p className="brief-kicker">Brief</p><p className="mt-2 text-sm font-medium capitalize text-muted-foreground">{date}</p>{weatherContext && <p className="brief-hero-context">{weatherContext}</p>}</div><Button variant="ghost" className="dynamic-pill h-auto max-w-[min(48vw,12rem)] whitespace-normal text-right" onClick={onPillClick} aria-label={briefing.type === "morning" ? t("showEvening") : t("showMorning")}><BriefIcon name={periodIcon} size={14} /><span>{briefing.type === "morning" ? t("morningPill") : t("eveningPill")}</span></Button></div><h1 className="mt-10 font-display text-[42px] font-medium leading-[1.02] tracking-[-.055em] text-foreground sm:text-6xl"><span>{briefing.greeting}</span></h1><p className="mt-4 max-w-xl text-[16px] leading-7 text-muted-foreground">{t("greetingIntro")}</p></section>;
}

export function DailySummaryCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="summary-card"><div className="mb-5 flex items-center justify-between"><span className="eyebrow">{briefing.type === "morning" ? t("morningBrief") : t("eveningBrief")}</span><span className="text-xs text-muted-foreground">{t("generatedNow")}</span></div><h2 className="mb-3 font-display text-xl font-semibold">{t("dailySummary")}</h2><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.summary}</p></CardShell>;
}

export function PriorityCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  const items = briefing.type === "evening" ? briefing.unfinishedItems : briefing.priorities;
  return <CardShell><CardHeading icon="important" title={t("importantToday")} action={`${items.length}`} /><div className="space-y-1">{items.map((item) => <div className="priority-row" key={item.id}><span className="priority-icon"><BriefIcon name={item.source === "calendar" ? "calendar" : "task"} size={15} /></span><div className="min-w-0 flex-1"><p className="font-medium leading-5">{item.title}</p>{item.time && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><BriefIcon name="time" size={12} />{item.time}</p>}</div></div>)}</div></CardShell>;
}

export function CalendarCard({ briefing, expanded = false }: { briefing: Briefing; expanded?: boolean }) {
  const { briefingLanguage, t, user } = useApp();
  const nativeCalendar = useNativeCalendarEvents();
  const locale = briefingLanguage === "bg" ? "bg-BG" : "en-GB";
  const formatTime = (value: string) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: user.timezone }).format(new Date(value));
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: user.timezone }).format(new Date(value));
  const isToday = (value: string) => { const d = new Date(value); const now = new Date(); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate(); };
  if (nativeCalendar.status === "permission_denied") return <CardShell><CardHeading icon="calendar" title={expanded ? t("scheduleOverview") : t("schedule")} /><div className="space-y-3"><p className="flex items-center gap-2 text-sm font-medium"><BriefIcon className="text-muted-foreground" name="calendar" size={15} />{t("calendarPermissionTitle")}</p><p className="text-xs leading-5 text-muted-foreground">{t("calendarPermissionHint")}</p><Button size="sm" variant="secondary" onClick={() => void nativeCalendar.requestAccess()}>{t("calendarAllowAccess")}</Button></div></CardShell>;
  return <CardShell><CardHeading icon="calendar" title={briefing.type === "evening" ? t("tomorrow") : expanded ? t("scheduleOverview") : t("schedule")} action={`${briefing.calendar.length} ${t("events")}`} /><div className="space-y-4">{briefing.calendar.map((item, index) => <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3" key={item.id}><p className="flex items-center gap-1 pt-0.5 text-sm font-semibold text-primary"><BriefIcon name="time" size={12} />{formatTime(item.start)}</p><div className={cn("min-w-0 border-l-2 pl-3", index === 1 ? "border-accent-strong" : "border-border")}><p className="flex items-center gap-2 font-medium"><BriefIcon className="shrink-0 text-muted-foreground" name={item.title.toLocaleLowerCase().includes("универс") || item.title.toLocaleLowerCase().includes("university") ? "university" : "work"} size={14} />{item.title}</p><p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><BriefIcon className="shrink-0" name={item.location ? "location" : "time"} size={12} /><span className="truncate">{isToday(item.start) ? "" : `${formatDate(item.start)} · `}{formatTime(item.end)}{item.location ? ` · ${item.location}` : ""}</span></p></div></div>)}</div></CardShell>;
}

export function WeatherCard({ briefing }: { briefing: Briefing }) {
  const { t, briefingLanguage: language } = useApp();
  const { status } = useSyncExternalStore(subscribeWeather, getWeatherState, getWeatherState);
  if (!briefing.weather.available) {
    const message = status === "loading" || status === "idle" ? t("weatherLoading") : status === "permission_denied" ? t("weatherPermissionDenied") : briefing.weather.summary;
    return <CardShell className="weather-card"><CardHeading icon="weather" title={t("weather")} /><p className="flex items-center gap-2 text-sm text-muted-foreground"><BriefIcon name="weather" />{message}</p>{status === "permission_denied" || status === "unavailable" ? <button type="button" className="mt-3 text-sm font-medium text-primary" onClick={() => void refreshWeather(language, true)}>{t("weatherRetry")}</button> : null}</CardShell>;
  }
  return <CardShell className="weather-card"><CardHeading icon="weather" title={t("weather")} action={briefing.weather.location} /><div className="flex items-end justify-between gap-4"><div><p className="flex items-center gap-3 font-display text-5xl font-medium"><BriefIcon className="text-primary" name="weather" size={27} strokeWidth={1.6} />{briefing.weather.temperature}°{briefing.weather.unit === "F" ? "F" : ""}</p><p className="mt-2 text-sm text-muted-foreground">{briefing.weather.condition}</p></div><div className="text-right text-xs leading-6 text-muted-foreground"><p>{t("high")} {briefing.weather.high}°</p><p>{t("low")} {briefing.weather.low}°</p></div></div></CardShell>;
}

export function NewsCard({ briefing, expanded = false }: { briefing: Briefing; expanded?: boolean }) {
  const { t } = useApp();
  const items = expanded ? briefing.news : briefing.news.slice(0, 2);
  return <CardShell><CardHeading icon="news" title={t("selectedNews")} /><div className="divide-y divide-border">{items.map((item) => <article className="group grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-4 first:pt-0 last:pb-0" key={item.id}><div className="min-w-0"><p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary"><BriefIcon name={item.category === "Фокус" || item.category === "Focus" ? "aiInsight" : "news"} size={12} />{item.category}</p><h3 className="text-[15px] font-medium leading-6">{item.title}</h3><p className="mt-2 text-xs text-muted-foreground">{item.source}</p></div><BriefIcon className="mt-1 shrink-0 text-muted-foreground" name="externalLink" size={16} /></article>)}</div></CardShell>;
}

export function InsightCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="insight-card"><CardHeading icon="aiInsight" title={t("personalInsight")} /><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.insight}</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary"><BriefIcon name="time" size={13} />{t("focusTime")}</div></CardShell>;
}

export function EveningRecapCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="evening-card"><CardHeading icon="evening" title={t("eveningBrief")} /><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.tomorrowPreview}</p></CardShell>;
}
