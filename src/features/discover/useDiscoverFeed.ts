import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/features/i18n/I18nProvider";
import type { TranslationKey } from "@/features/i18n/translations";
import { discoverFeedProvider } from "./MockDiscoverFeedProvider";
import { rankDiscoverStories } from "./discoverEngine";
import { useDiscoverPreferences } from "./DiscoverPreferences";
import type { DiscoverCategory, DiscoverStory } from "./types";

export type DiscoverFeedStatus = "ready" | "loading" | "offline" | "error";

export const categoryKey = (category: DiscoverCategory | "all") =>
  (`cat${category === "green" ? "Green" : category.charAt(0).toUpperCase() + category.slice(1)}`) as TranslationKey;

/** Loads source stories through the DiscoverFeedProvider and ranks them with the user's explicit preferences. */
export function useDiscoverFeed() {
  const { preferences } = useDiscoverPreferences();
  const [sourceStories, setSourceStories] = useState(() => discoverFeedProvider.getSnapshot());
  const [status, setStatus] = useState<DiscoverFeedStatus>("ready");

  const refresh = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { setStatus("offline"); return; }
    setStatus("loading");
    try { setSourceStories(await discoverFeedProvider.refresh()); setStatus("ready"); } catch { setStatus("error"); }
  }, []);

  useEffect(() => {
    const offline = () => setStatus("offline");
    window.addEventListener("offline", offline);
    return () => window.removeEventListener("offline", offline);
  }, []);

  const stories = useMemo(() => rankDiscoverStories(sourceStories, preferences, discoverFeedProvider.now()), [sourceStories, preferences]);
  return { stories, status, setStatus, refresh, categories: discoverFeedProvider.getCategories(), now: discoverFeedProvider.now() };
}

/** Localized label helper for briefing integration. */
export function useDiscoverCategoryLabel() {
  const { t } = useApp();
  return (story: DiscoverStory) => t(categoryKey(story.category));
}
