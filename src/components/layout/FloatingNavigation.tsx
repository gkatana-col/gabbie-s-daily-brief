import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { getTimeOfDay, type TimeOfDay } from "@/features/briefing/briefingEngine";
import { BriefIcon, type BriefIconName } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";
import { refetchBriefingData } from "@/features/briefing/useBriefing";

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

export function PullToRefresh({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
}) {
  const { t, briefingLanguage } = useApp();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  pullRef.current = pull;
  const refreshingRef = useRef(refreshing);
  refreshingRef.current = refreshing;

  const threshold = 48;

  const triggerRefresh = async () => {
    setRefreshing(true);
    setPull(0);
    setIsDragging(false);
    const startTime = Date.now();
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refetchBriefingData(briefingLanguage);
      }
    } catch (err) {
      console.error("Data refresh failed:", err);
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 550) {
        await new Promise((resolve) => setTimeout(resolve, 550 - elapsed));
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (refreshingRef.current) return;
      if (window.scrollY <= 2) {
        startY.current = event.touches[0]?.clientY ?? null;
      } else {
        startY.current = null;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (refreshingRef.current || startY.current === null) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const deltaY = currentY - startY.current;

      if (deltaY > 0 && window.scrollY <= 2) {
        // Damped pull distance
        const damped = Math.min(76, Math.max(0, deltaY * 0.52));
        setPull(damped);
        setIsDragging(true);
      } else if (deltaY < 0) {
        setPull(0);
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      if (refreshingRef.current) return;
      if (pullRef.current >= threshold) {
        void triggerRefresh();
      } else {
        setPull(0);
        setIsDragging(false);
      }
      startY.current = null;
    };

    // Also support mouse/pointer drag down near top of viewport for testing & desktop convenience
    const handlePointerDown = (event: PointerEvent) => {
      if (refreshingRef.current || event.pointerType === "touch") return;
      if (window.scrollY <= 2 && event.clientY < 140) {
        startY.current = event.clientY;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (refreshingRef.current || event.pointerType === "touch" || startY.current === null) return;
      if ((event.buttons & 1) !== 1) {
        startY.current = null;
        setPull(0);
        setIsDragging(false);
        return;
      }
      const deltaY = event.clientY - startY.current;
      if (deltaY > 6 && window.scrollY <= 2) {
        const damped = Math.min(76, Math.max(0, deltaY * 0.52));
        setPull(damped);
        setIsDragging(true);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (startY.current !== null) {
        if (pullRef.current >= threshold) {
          void triggerRefresh();
        } else {
          setPull(0);
          setIsDragging(false);
        }
        startY.current = null;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [briefingLanguage, onRefresh]);

  const showIndicator = pull > 0 || refreshing;
  const isThresholdReached = pull >= threshold;
  const rotation = Math.min(360, pull * 6.5);
  const indicatorY = refreshing ? 20 : Math.min(24, pull * 0.38);
  const contentY = refreshing ? 20 : Math.min(30, pull * 0.4);

  return (
    <>
      {showIndicator && (
        <div
          className="pull-indicator"
          role="status"
          aria-live="polite"
          style={{
            opacity: refreshing ? 1 : Math.min(1, Math.max(0, (pull - 6) / 30)),
            transform: `translate(-50%, ${indicatorY}px)`,
            pointerEvents: "none",
          }}
        >
          <BriefIcon
            name="refresh"
            size={16}
            className={refreshing ? "animate-spin" : ""}
            style={
              refreshing
                ? undefined
                : {
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.05s linear",
                  }
            }
          />
          <span>
            {refreshing
              ? t("refreshing")
              : isThresholdReached
                ? t("releaseToRefresh")
                : t("pullToRefresh")}
          </span>
        </div>
      )}
      <div
        style={{
          transform: contentY > 0 ? `translate3d(0, ${contentY}px, 0)` : undefined,
          transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </>
  );
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
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getAtmosphericTextColors(sky: { top: string; middle: string; horizon: string }) {
  const toRgb = (value: string) => value.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const luminance = (value: string) => {
    const [red, green, blue] = toRgb(value);
    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  };
  const brightness = (luminance(sky.top) + luminance(sky.middle) + luminance(sky.horizon)) / 3;
  const lightTextAmount = clamp((0.56 - brightness) / 0.28, 0, 1);
  const mix = (dark: SkyColor, light: SkyColor) => rgb(interpolateColor(dark, light, lightTextAmount));
  const foregroundAmount = lightTextAmount;
  const adaptive = (dark: SkyColor, light: SkyColor) => rgb(interpolateColor(dark, light, foregroundAmount));
  return {
    foreground: adaptive([12, 20, 32], [250, 252, 255]),
    muted: adaptive([35, 47, 64], [232, 240, 248]),
    primary: adaptive([8, 61, 105], [230, 246, 255]),
    border: adaptive([14, 35, 62], [255, 255, 255]),
    textShadow: lightTextAmount > 0.52 ? "rgba(3, 13, 28, .58)" : "rgba(255, 255, 255, .58)",
  };
}

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
  const textColors = useMemo(() => getAtmosphericTextColors(sky), [sky]);

  useEffect(() => {
    setNow(new Date());
    const updateTime = () => setNow(new Date());
    const interval = window.setInterval(updateTime, 60_000);
    window.addEventListener("focus", updateTime);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updateTime);
    };
  }, []);

  return (
    <div
      suppressHydrationWarning
      className={`app-atmosphere atmosphere-${period}`}
      style={
        {
          "--sky-top": sky.top,
          "--sky-middle": sky.middle,
          "--sky-horizon": sky.horizon,
          "--foreground": textColors.foreground,
          "--muted-foreground": textColors.muted,
          "--primary": textColors.primary,
          "--adaptive-border": textColors.border,
          "--text-shadow": textColors.textShadow,
        } as CSSProperties
      }
    >
      <PullToRefresh>{children}</PullToRefresh>
    </div>
  );
}

