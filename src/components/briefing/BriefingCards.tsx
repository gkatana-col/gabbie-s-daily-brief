import { ArrowUpRight, Brain, CalendarDays, Check, CloudSun, Leaf, MoonStar, Newspaper, Sparkles, Sun } from "lucide-react";
import type { Briefing } from "@/features/briefing/types";
import { useApp } from "@/features/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("brief-card", className)}>{children}</section>;
}
function CardHeading({ icon: Icon, title, action }: { icon: typeof Brain; title: string; action?: string | undefined }) {
  return <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="icon-well"><Icon size={17} /></span><h2 className="truncate font-display text-[15px] font-semibold">{title}</h2></div>{action && <span className="text-xs font-medium text-muted-foreground">{action}</span>}</div>;
}

export function GreetingCard({ briefing, onPillClick }: { briefing: Briefing; onPillClick: () => void }) {
  const { t, language } = useApp();
  const date = new Intl.DateTimeFormat(language === "bg" ? "bg-BG" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(briefing.generatedAt));
  const greetingText = briefing.greeting.replace(/[☀️🌙]/gu, "").trim();
  const PeriodIcon = briefing.type === "morning" ? Sun : MoonStar;
  return <section className="relative overflow-hidden px-1 pt-2"><div className="mb-7 flex items-center justify-between gap-3"><div className="brand-mark" aria-hidden="true"><Leaf size={16} /></div><Button variant="ghost" className="dynamic-pill h-auto max-w-[min(78vw,18rem)] whitespace-normal text-right" onClick={onPillClick} aria-label={briefing.type === "morning" ? t("showEvening") : t("showMorning")}><PeriodIcon size={13} /><span>{briefing.type === "morning" ? t("morningPill") : t("eveningPill")}</span></Button></div><p className="mb-2 text-sm font-medium capitalize text-muted-foreground">{date}</p><h1 className="flex items-center gap-2 font-display text-[34px] font-semibold leading-tight text-foreground sm:text-4xl"><span>{greetingText}</span><PeriodIcon className="shrink-0" size={30} aria-hidden="true" /></h1><p className="mt-3 max-w-xl text-[17px] leading-7 text-muted-foreground">{t("greetingIntro")}</p></section>;
}

export function DailySummaryCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="summary-card"><div className="mb-5 flex items-center justify-between"><span className="eyebrow"><Sparkles size={13} />{briefing.type === "morning" ? t("morningBrief") : t("eveningBrief")}</span><span className="text-xs text-muted-foreground">{t("generatedNow")}</span></div><h2 className="mb-3 font-display text-xl font-semibold">{t("dailySummary")}</h2><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.summary}</p></CardShell>;
}

export function PriorityCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  const items = briefing.type === "evening" ? briefing.unfinishedItems : briefing.priorities;
  return <CardShell><CardHeading icon={Check} title={t("importantToday")} action={`${items.length}`} /><div className="space-y-1">{items.map((item, index) => <div className="priority-row" key={item.id}><span className="priority-number">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-medium leading-5">{item.title}</p>{item.time && <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>}</div></div>)}</div></CardShell>;
}

export function CalendarCard({ briefing, expanded = false }: { briefing: Briefing; expanded?: boolean }) {
  const { briefingLanguage, t, user } = useApp();
  const formatTime = (value: string) => new Intl.DateTimeFormat(briefingLanguage === "bg" ? "bg-BG" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: user.timezone }).format(new Date(value));
  return <CardShell><CardHeading icon={CalendarDays} title={briefing.type === "evening" ? t("tomorrow") : expanded ? t("scheduleOverview") : t("schedule")} action={`${briefing.calendar.length} ${t("events")}`} /><div className="space-y-4">{briefing.calendar.map((item, index) => <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3" key={item.id}><p className="pt-0.5 text-sm font-semibold text-primary">{formatTime(item.start)}</p><div className={cn("min-w-0 border-l-2 pl-3", index === 1 ? "border-accent-strong" : "border-border")}><p className="font-medium">{item.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{formatTime(item.end)}{item.location ? ` · ${item.location}` : ""}</p></div></div>)}</div></CardShell>;
}

export function WeatherCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  if (!briefing.weather.available) return <CardShell className="weather-card"><CardHeading icon={CloudSun} title={t("weather")} /><p className="text-sm text-muted-foreground">{briefing.weather.summary}</p></CardShell>;
  return <CardShell className="weather-card"><CardHeading icon={CloudSun} title={t("weather")} action={briefing.weather.location} /><div className="flex items-end justify-between gap-4"><div><p className="font-display text-5xl font-medium">{briefing.weather.temperature}°</p><p className="mt-2 text-sm text-muted-foreground">{briefing.weather.condition}</p></div><div className="text-right text-xs leading-6 text-muted-foreground"><p>{t("high")} {briefing.weather.high}°</p><p>{t("low")} {briefing.weather.low}°</p></div></div></CardShell>;
}

export function NewsCard({ briefing, expanded = false }: { briefing: Briefing; expanded?: boolean }) {
  const { t } = useApp();
  const items = expanded ? briefing.news : briefing.news.slice(0, 2);
  return <CardShell><CardHeading icon={Newspaper} title={t("selectedNews")} /><div className="divide-y divide-border">{items.map((item) => <article className="group grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-4 first:pt-0 last:pb-0" key={item.id}><div className="min-w-0"><p className="mb-1.5 text-xs font-medium text-primary">{item.category}</p><h3 className="text-[15px] font-medium leading-6">{item.title}</h3><p className="mt-2 text-xs text-muted-foreground">{item.source}</p></div><ArrowUpRight className="mt-1 shrink-0 text-muted-foreground" size={17} /></article>)}</div></CardShell>;
}

export function InsightCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="insight-card"><CardHeading icon={Brain} title={t("personalInsight")} /><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.insight}</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{t("focusTime")}</div></CardShell>;
}

export function EveningRecapCard({ briefing }: { briefing: Briefing }) {
  const { t } = useApp();
  return <CardShell className="evening-card"><CardHeading icon={MoonStar} title={t("eveningBrief")} /><p className="text-[15px] leading-7 text-card-foreground/80">{briefing.tomorrowPreview}</p></CardShell>;
}