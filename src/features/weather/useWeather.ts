import { useEffect, useSyncExternalStore } from "react";
import type { ResolvedLanguage } from "@/features/briefing/types";
import { getWeatherState, refreshWeather, subscribeWeather, type WeatherState } from "./weatherService";

const serverState: WeatherState = { status: "idle", reading: null };

/** Shared live weather state; refreshes on mount and whenever Brief returns to the foreground. */
export function useWeather(language: ResolvedLanguage): WeatherState {
  const state = useSyncExternalStore(subscribeWeather, getWeatherState, () => serverState);
  useEffect(() => {
    void refreshWeather(language);
    const onVisible = () => { if (document.visibilityState === "visible") void refreshWeather(language); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [language]);
  return state;
}
