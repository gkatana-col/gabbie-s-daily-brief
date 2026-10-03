import { useMemo } from "react";
import { useApp } from "@/features/i18n/I18nProvider";
import { getTranslation } from "@/features/i18n/translations";
import { useDiscoverPreferences } from "@/features/discover/DiscoverPreferences";
import { discoverFeedProvider } from "@/features/discover/MockDiscoverFeedProvider";
import { rankDiscoverStories, toBriefingNews } from "@/features/discover/discoverEngine";
import { categoryKey } from "@/features/discover/useDiscoverFeed";
import { generateCachedBriefing } from "./briefingEngine";
import { createMockBriefingInput } from "./mockData";
import type { BriefingType } from "./types";

export function useBriefing(type: BriefingType) {
  const { user, briefingLanguage } = useApp();
  const { preferences } = useDiscoverPreferences();
  return useMemo(() => {
    const input = createMockBriefingInput(type, briefingLanguage, user);
    // Discover stays a separate module; the briefing only receives its top few ranked stories as plain news input.
    const ranked = rankDiscoverStories(discoverFeedProvider.getSnapshot(), { ...preferences, language: briefingLanguage }, discoverFeedProvider.now());
    input.news = toBriefingNews(ranked, (story) => getTranslation(briefingLanguage, categoryKey(story.category)), 3);
    return generateCachedBriefing(input);
  }, [briefingLanguage, type, user, preferences]);
}
