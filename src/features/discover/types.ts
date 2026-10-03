import type { ResolvedLanguage } from "@/features/briefing/types";

export type DiscoverCategory = "bulgaria" | "world" | "technology" | "science" | "business" | "education" | "green" | "culture" | "explainers";
export type DiscoverCategoryFilter = DiscoverCategory | "all";
export type LocalizedText = Record<ResolvedLanguage, string>;

/** Raw story as delivered by a feed source (RSS, API, mock). Only facts from the source. */
export interface DiscoverSourceStory {
  id: string;
  topicKey: string;
  category: DiscoverCategory;
  headline: LocalizedText;
  excerpt: LocalizedText;
  keyFacts: LocalizedText[];
  /** Editorial context supplied with the source; rendered as interpretation, never as fact. */
  context?: LocalizedText;
  source: { name: string; url: string };
  publishedAt: string;
  imageUrl?: string | undefined;
  readingMinutes: number;
  important?: boolean;
}

export type DiscoverReason =
  | { kind: "category"; category: DiscoverCategory }
  | { kind: "source"; source: string }
  | { kind: "saved"; category: DiscoverCategory }
  | { kind: "important" }
  | { kind: "fresh" };

/** Processed story produced by discoverEngine, localized for display. */
export interface DiscoverStory {
  id: string;
  topicKey: string;
  category: DiscoverCategory;
  headline: string;
  summary: string;
  aiSummary: boolean;
  whyItMatters?: string | undefined;
  keyPoints: string[];
  source: { name: string; url: string };
  relatedSources: string[];
  publishedAt: string;
  imageUrl?: string | undefined;
  readingMinutes: number;
  important: boolean;
  score: number;
  reasons: DiscoverReason[];
}

export interface DiscoverPreferences {
  preferredCategories: DiscoverCategory[];
  language: ResolvedLanguage;
  preferredSources: string[];
  blockedTopics: string[];
  savedStories: string[];
  readingHistory: string[];
  hiddenStories: string[];
  personalizationEnabled: boolean;
}

export interface DiscoverFeedProvider {
  getStories(): Promise<DiscoverSourceStory[]>;
  getCategories(): DiscoverCategory[];
  getStory(id: string): DiscoverSourceStory | undefined;
  refresh(): Promise<DiscoverSourceStory[]>;
  /** Reference "now" used for freshness; real providers return the current time. */
  now(): string;
}
