import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/features/i18n/I18nProvider";
import { getTranslation } from "@/features/i18n/translations";
import { useDiscoverPreferences } from "@/features/discover/DiscoverPreferences";
import { discoverFeedProvider } from "@/features/discover/MockDiscoverFeedProvider";
import { rankDiscoverStories, toBriefingNews } from "@/features/discover/discoverEngine";
import { categoryKey } from "@/features/discover/useDiscoverFeed";
import { useNativeCalendarEvents, type NativeCalendarState } from "@/features/native/useNativeCalendar";
import { useWeather } from "@/features/weather/useWeather";
import { refreshWeather, toWeatherData } from "@/features/weather/weatherService";
import { clearBriefingCache, generateCachedBriefing } from "./briefingEngine";
import { createMockBriefingInput } from "./mockData";
import type { BriefingInput, BriefingType, ResolvedLanguage } from "./types";

const briefingListeners = new Set<() => void>();

export function subscribeBriefingUpdates(listener: () => void): () => void {
  briefingListeners.add(listener);
  return () => {
    briefingListeners.delete(listener);
  };
}

export function triggerBriefingUpdate(): void {
  briefingListeners.forEach((listener) => listener());
}

/** Triggers a clean async data re-fetch across weather, discover feed, and briefing cache without reloading. */
export async function refetchBriefingData(language: ResolvedLanguage): Promise<void> {
  clearBriefingCache();
  await Promise.allSettled([
    refreshWeather(language, true),
    discoverFeedProvider.refresh(),
  ]);
  triggerBriefingUpdate();
}

/** Replaces mock calendar events with real device events only when native access is granted and returned events. */
export function applyNativeCalendar(input: BriefingInput, nativeCalendar: Pick<NativeCalendarState, "status" | "items">): BriefingInput {
  // Browser keeps demo data; on the device only real events are shown (none when denied/empty, never mock).
  if (nativeCalendar.status === "web") return input;
  if (nativeCalendar.status !== "ok") return { ...input, calendarEvents: [] };
  // CalendarEvent stores only user-defined importance ("critical" is engine-computed), so map it down; the engine re-scores anyway.
  return { ...input, calendarEvents: nativeCalendar.items.map(({ importance, ...item }) => ({ ...item, importance: importance === "critical" ? "high" as const : importance })) };
}

export function useBriefing(type: BriefingType) {
  const { user, briefingLanguage } = useApp();
  const { preferences } = useDiscoverPreferences();
  const nativeCalendar = useNativeCalendarEvents();
  const liveWeather = useWeather(briefingLanguage);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    return subscribeBriefingUpdates(() => setRefreshToken((prev) => prev + 1));
  }, []);

  return useMemo(() => {
    const input = applyNativeCalendar(createMockBriefingInput(type, briefingLanguage, user), nativeCalendar);
    // Weather is live only: a fresh reading or nothing (never mock, placeholder or stale data).
    input.weather = liveWeather.status === "ok" && liveWeather.reading ? toWeatherData(liveWeather.reading, briefingLanguage) : null;
    // Discover stays a separate module; the briefing only receives its top few ranked stories as plain news input.
    const ranked = rankDiscoverStories(discoverFeedProvider.getSnapshot(), { ...preferences, language: briefingLanguage }, discoverFeedProvider.now());
    input.news = toBriefingNews(ranked, (story) => getTranslation(briefingLanguage, categoryKey(story.category)), 3);
    return generateCachedBriefing(input);
  }, [briefingLanguage, type, user, preferences, nativeCalendar, liveWeather, refreshToken]);
}
