import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { getTimeOfDay, type TimeOfDay } from "@/features/briefing/briefingEngine";
import { BriefIcon, type BriefIconName } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";

const navItems: ReadonlyArray<{ to: "/" | "/today" | "/news" | "/calendar" | "/settings"; key: "home" | "today" | "news" | "calendar" | "settings"; icon: BriefIconName; exact: boolean }> = [
  { to: "/", key: "home", icon: "home", exact: true },
  { to: "/today", key: "today", icon: "morning", exact: false },
  { to: "/news", key: "news", icon: "news", exact: false },
  { to: "/calendar", key: "calendar", icon: "calendar", exact: false },
  { to: "/settings", key: "settings", icon: "settings", exact: false },
];

export function FloatingNavigation() {
  const { t } = useApp();
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setHidden(current > 72 && current > lastScroll.current + 8);
      if (current < 24 || current < lastScroll.current - 8) setHidden(false);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <nav aria-label={t("brand")} className={`floating-nav ${hidden ? "floating-nav-hidden" : ""}`}><div className="floating-nav-inner">{navItems.map(({ to, key, icon, exact }) => <Link key={to} to={to} activeOptions={{ exact }} className="nav-item" activeProps={{ className: "nav-item nav-item-active" }}><BriefIcon name={icon} size={19} /><span>{t(key)}</span></Link>)}</div></nav>;
}

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => { if (window.scrollY === 0) start.current = event.touches[0]?.clientY ?? null; };
    const onTouchMove = (event: TouchEvent) => { if (start.current !== null) setPull(Math.min(72, Math.max(0, (event.touches[0]?.clientY ?? 0) - start.current))); };
    const onTouchEnd = () => { if (pull > 54) { setRefreshing(true); window.setTimeout(() => window.location.reload(), 350); } else { setPull(0); } start.current = null; };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onTouchEnd); };
  }, [pull]);

  return <>{(pull > 0 || refreshing) && <div className="pull-indicator" style={{ opacity: Math.min(1, pull / 46), transform: `translate(-50%, ${Math.min(18, pull / 3)}px)` }}><BriefIcon name="refresh" size={16} className={refreshing ? "animate-spin" : ""} /><span>{refreshing ? "Обновяване" : "Издърпай за обновяване"}</span></div>}{children}</>;
}

type SkyColor = [number, number, number];

const skyStops: ReadonlyArray<[number, SkyColor, SkyColor, SkyColor]> = [
  [0, [8, 23, 55], [18, 39, 82], [30, 52, 94]],
  [300, [30, 52, 94], [77, 100, 139], [238, 225, 205]],
  [480, [238, 225, 205], [137, 190, 225], [250, 247, 239]],
  [660, [177, 214, 237], [92, 170, 219], [248, 252, 253]],
  [960, [92, 170, 219], [124, 181, 221], [248, 251, 253]],
  [1080, [83, 133, 189], [124, 132, 181], [235, 201, 175]],
  [1320, [42, 66, 126], [66, 65, 116], [116, 94, 127]],
  [1440, [8, 23, 55], [18, 39, 82], [30, 52, 94]],
];

const interpolateColor = (from: SkyColor, to: SkyColor, amount: number) => from.map((value, index) => Math.round(value + ((to[index] ?? value) - value) * amount)) as SkyColor;
const rgb = (color: SkyColor) => `rgb(${color.join(",")})`;

function getSkyColors(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const normalizedMinutes = minutes < 300 ? minutes + 1440 : minutes;
  const stopIndex = skyStops.findIndex((stop, index) => normalizedMinutes >= stop[0] && normalizedMinutes <= (skyStops[index + 1]?.[0] ?? 1440));
  const index = stopIndex < 0 ? skyStops.length - 2 : stopIndex;
  const startStop = skyStops[index] ?? skyStops[0]!;
  const endStop = skyStops[index + 1] ?? skyStops[skyStops.length - 1]!;
  const [start, startTop, startMiddle, startHorizon] = startStop;
  const [end, endTop, endMiddle, endHorizon] = endStop;
  const amount = (normalizedMinutes - start) / (end - start);
  return { top: rgb(interpolateColor(startTop, endTop, amount)), middle: rgb(interpolateColor(startMiddle, endMiddle, amount)), horizon: rgb(interpolateColor(startHorizon, endHorizon, amount)) };
}

export function getAtmosphere(hour = new Date().getHours()): TimeOfDay {
  return getTimeOfDay(hour);
}

export function AtmosphereShell({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const period = getAtmosphere(now.getHours());
  const sky = useMemo(() => getSkyColors(now), [now]);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const interval = window.setInterval(updateTime, 60_000);
    window.addEventListener("focus", updateTime);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updateTime);
    };
  }, []);

  return <div className={`app-atmosphere atmosphere-${period}`} style={{ "--sky-top": sky.top, "--sky-middle": sky.middle, "--sky-horizon": sky.horizon } as CSSProperties}><PullToRefresh>{children}</PullToRefresh></div>;
}

