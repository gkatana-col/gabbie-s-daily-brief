import { useEffect, useRef, useState } from "react";
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

export function getAtmosphere(hour = new Date().getHours()): TimeOfDay {
  return getTimeOfDay(hour);
}

export function AtmosphereShell({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<TimeOfDay>(() => getAtmosphere());

  useEffect(() => {
    const updatePeriod = () => setPeriod(getAtmosphere());
    const interval = window.setInterval(updatePeriod, 60_000);
    window.addEventListener("focus", updatePeriod);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updatePeriod);
    };
  }, []);

  return <div className={`app-atmosphere atmosphere-${period}`}><PullToRefresh>{children}</PullToRefresh></div>;
}

