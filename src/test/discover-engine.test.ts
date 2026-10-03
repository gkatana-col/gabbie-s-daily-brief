import { describe, expect, it } from "vitest";
import { mockDiscoverStories, MockDiscoverFeedProvider } from "@/features/discover/MockDiscoverFeedProvider";
import { rankDiscoverStories, removeDuplicates, selectPillStory, summarize, toBriefingNews } from "@/features/discover/discoverEngine";
import { mockDiscoverPreferences } from "@/features/discover/DiscoverPreferences";
import { getTranslation } from "@/features/i18n/translations";

const now = "2026-10-03T12:00:00+03:00";
const prefs = { ...mockDiscoverPreferences, language: "bg" as const };

describe("discoverEngine", () => {
  it("groups related coverage and keeps source attribution", () => {
    const ranked = rankDiscoverStories(mockDiscoverStories, prefs, now);
    expect(ranked.find((s) => s.id === "d1b")).toBeUndefined();
    const eu = ranked.find((s) => s.id === "d1")!;
    expect(eu.source.name).toBe("Reuters");
    expect(eu.relatedSources).toEqual(["Euractiv"]);
  });
  it("removes exact duplicate headlines", () => {
    expect(removeDuplicates([mockDiscoverStories[0]!, { ...mockDiscoverStories[0]!, id: "dup" }])).toHaveLength(1);
  });
  it("summaries only use the source excerpt", () => {
    expect(summarize("Първо изречение. Второ изречение.")).toBe("Първо изречение.");
  });
  it("hides stories, blocked topics and respects disabled personalization", () => {
    const ranked = rankDiscoverStories(mockDiscoverStories, { ...prefs, hiddenStories: ["d2"], blockedTopics: ["eu-chips"] }, now);
    expect(ranked.map((s) => s.id)).not.toContain("d2");
    expect(ranked.map((s) => s.id)).not.toContain("d3");
    const plain = rankDiscoverStories(mockDiscoverStories, { ...prefs, personalizationEnabled: false }, now);
    expect(plain.every((s) => !s.reasons.some((r) => r.kind === "category"))).toBe(true);
  });
  it("localizes output to English", () => {
    expect(rankDiscoverStories(mockDiscoverStories, { ...prefs, language: "en" }, now)[0]!.headline).toBe("EU agrees on new renewable-energy measures");
  });
  it("feeds the briefing only the top 3 stories and the pill only fresh important ones", () => {
    const ranked = rankDiscoverStories(mockDiscoverStories, prefs, now);
    expect(toBriefingNews(ranked, () => "x")).toHaveLength(3);
    expect(selectPillStory(ranked, now)?.id).toBe("d1");
    expect(selectPillStory(ranked, "2026-10-03T18:00:00+03:00")).toBeUndefined();
  });
  it("provider exposes stories and categories", async () => {
    const provider = new MockDiscoverFeedProvider(mockDiscoverStories, 0);
    expect((await provider.refresh()).length).toBe(mockDiscoverStories.length);
    expect(provider.getStory("d4")?.source.name).toBe("Капитал");
    expect(provider.getCategories()).toHaveLength(8);
  });
  it("has Discover titles in both languages", () => {
    expect(getTranslation("bg", "discoverTitle")).toBe("Открий");
    expect(getTranslation("en", "discoverSubtitle")).toBe("Curated for you");
  });
});
