import type { NewsArticle, ResolvedLanguage } from "@/features/briefing/types";
import type { DiscoverPreferences, DiscoverReason, DiscoverSourceStory, DiscoverStory } from "./types";

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

/** Removes obvious duplicates (same URL+headline or identical normalized headline). */
export function removeDuplicates(stories: DiscoverSourceStory[]) {
  const seen = new Set<string>();
  return stories.filter((story) => {
    const key = normalize(story.headline.en);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Groups related coverage by topic; the primary story keeps the others as related sources. */
export function groupRelatedStories(stories: DiscoverSourceStory[]) {
  const groups = new Map<string, DiscoverSourceStory[]>();
  for (const story of stories) groups.set(story.topicKey, [...(groups.get(story.topicKey) ?? []), story]);
  return [...groups.values()].map((group) => {
    const sorted = [...group].sort((a, b) => Number(!!b.important) - Number(!!a.important) || b.keyFacts.length - a.keyFacts.length || b.publishedAt.localeCompare(a.publishedAt));
    return { primary: sorted[0]!, related: sorted.slice(1).map((item) => item.source.name) };
  });
}

/** Concise summary derived only from the source excerpt (first sentence, trimmed). Never adds facts. */
export function summarize(text: string, maxLength = 180) {
  const first = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return first.length <= maxLength ? first : `${first.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

export const hoursBetween = (from: string, to: string) => (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000;

/** Transparent, deterministic ranking. Uses only explicit preferences and in-app actions. */
export function rankDiscoverStories(stories: DiscoverSourceStory[], preferences: DiscoverPreferences, now: string): DiscoverStory[] {
  const language = preferences.language;
  const personalized = preferences.personalizationEnabled;
  const savedCategories = new Set(stories.filter((s) => preferences.savedStories.includes(s.id)).map((s) => s.category));
  const candidates = groupRelatedStories(removeDuplicates(stories)).filter(({ primary }) =>
    !preferences.hiddenStories.includes(primary.id) && !preferences.blockedTopics.includes(primary.topicKey) && !preferences.blockedTopics.includes(primary.category));

  const scored = candidates.map(({ primary, related }) => {
    const reasons: DiscoverReason[] = [];
    const age = Math.max(0, hoursBetween(primary.publishedAt, now));
    let score = Math.max(0, 4 - age / 6);
    if (age <= 3) reasons.push({ kind: "fresh" });
    if (primary.important) { score += 2; reasons.push({ kind: "important" }); }
    score += Math.min(related.length, 2) * 0.5;
    if (personalized) {
      if (preferences.preferredCategories.includes(primary.category)) { score += 3; reasons.unshift({ kind: "category", category: primary.category }); }
      if (preferences.preferredSources.includes(primary.source.name)) { score += 1; reasons.push({ kind: "source", source: primary.source.name }); }
      if (savedCategories.has(primary.category)) { score += 1.5; reasons.push({ kind: "saved", category: primary.category }); }
      if (preferences.readingHistory.includes(primary.id)) score -= 2;
    }
    return { primary, related, score, reasons };
  });

  // Source diversity: greedily pick the best item, penalizing sources already shown.
  const result: DiscoverStory[] = [];
  const sourceCount = new Map<string, number>();
  const pool = [...scored];
  while (pool.length) {
    pool.sort((a, b) => (b.score - (sourceCount.get(b.primary.source.name) ?? 0) * 1.5) - (a.score - (sourceCount.get(a.primary.source.name) ?? 0) * 1.5) || a.primary.id.localeCompare(b.primary.id));
    const { primary, related, score, reasons } = pool.shift()!;
    sourceCount.set(primary.source.name, (sourceCount.get(primary.source.name) ?? 0) + 1);
    result.push({
      id: primary.id, topicKey: primary.topicKey, category: primary.category,
      headline: primary.headline[language], summary: summarize(primary.excerpt[language]), aiSummary: true,
      whyItMatters: primary.context?.[language], keyPoints: primary.keyFacts.map((fact) => fact[language]),
      source: primary.source, relatedSources: related, publishedAt: primary.publishedAt, imageUrl: primary.imageUrl,
      readingMinutes: primary.readingMinutes, important: !!primary.important, score: Math.round(score * 100) / 100, reasons,
    });
  }
  return result;
}

/** The single personal reason shown in "Why am I seeing this?" — never technical details. */
export const personalReason = (story: DiscoverStory) => story.reasons.find((r) => r.kind === "category" || r.kind === "saved" || r.kind === "source");

/** Adapter used by briefingEngine input: top Discover stories as plain news articles. */
export function toBriefingNews(stories: DiscoverStory[], categoryLabel: (story: DiscoverStory) => string, limit = 3): NewsArticle[] {
  return stories.slice(0, limit).map((story) => ({
    id: story.id, title: story.headline, source: story.source.name, category: categoryLabel(story), publishedAt: story.publishedAt,
    importance: story.important ? "high" : "medium", relevance: Math.min(1, story.score / 10),
  }));
}

/** Returns a story for the Dynamic Briefing Pill only when it is important and genuinely new (≤ 2h). */
export function selectPillStory(stories: DiscoverStory[], now: string, alreadyRead: string[] = []) {
  return stories.find((story) => story.important && !alreadyRead.includes(story.id) && hoursBetween(story.publishedAt, now) <= 2 && hoursBetween(story.publishedAt, now) >= 0);
}

export const discoverEngine = { removeDuplicates, groupRelatedStories, summarize, rankDiscoverStories, personalReason, toBriefingNews, selectPillStory };
export type { ResolvedLanguage };
