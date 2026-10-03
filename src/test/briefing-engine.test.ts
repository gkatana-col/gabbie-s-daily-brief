import { beforeEach, describe, expect, it } from "vitest";
import { calculateImportance, clearBriefingCache, generateBriefing, generateCachedBriefing } from "@/features/briefing/briefingEngine";
import { createMockBriefingInput } from "@/features/briefing/mockData";
import type { BriefingInput, ResolvedLanguage } from "@/features/briefing/types";

const emptyInput = (language: ResolvedLanguage = "bg"): BriefingInput => ({
  currentDateTime: "2026-10-03T08:15:00+03:00",
  calendarEvents: [],
  tasks: [],
  weather: null,
  news: [],
  userPreferences: { name: "Gabbie", language, timezone: "Europe/Sofia", personalPriorities: [] },
  briefingType: "morning",
});

describe("briefingEngine", () => {
  beforeEach(clearBriefingCache);

  it("generates a concise Bulgarian Morning Brief from supplied facts", () => {
    const briefing = generateBriefing(createMockBriefingInput("morning", "bg"));
    expect(briefing).toMatchObject({ type: "morning", greeting: "Добро утро" });
    expect(briefing.summary).toContain("3 ангажимента");
    expect(briefing.calendar).toHaveLength(3);
    expect(briefing.news).toHaveLength(3);
    expect(briefing.insight).toContain("свободен прозорец");
  });

  it("generates an Evening Brief with only evidenced completion and tomorrow data", () => {
    const briefing = generateBriefing(createMockBriefingInput("evening", "bg"));
    expect(briefing.greeting).toBe("Добър вечер");
    expect(briefing.summary).toBe("Днес приключи 1 от 3 планирани задачи.");
    expect(briefing.completedItems.map((item) => item.id)).toEqual(["t1"]);
    expect(briefing.unfinishedItems.map((item) => item.id)).toEqual(["t2", "t3"]);
    expect(briefing.tomorrowPreview).toContain("Утре имаш 1 важно събитие");
    expect(briefing.calendar.map((item) => item.id)).toEqual(["c4"]);
  });

  it("returns natural English independently of interface copy", () => {
    const briefing = generateBriefing(createMockBriefingInput("morning", "en"));
    expect(briefing.greeting).toBe("Good morning");
    expect(briefing.summary).toBe("Today you have 3 events and 2 tasks.");
    expect(briefing.calendar.some((item) => item.title === "University")).toBe(true);
    expect(briefing.weather.condition).toBe("Mostly sunny");
    expect(briefing.news[0]?.title).toBe("New European programmes support student innovation");
  });

  it("states insufficient data naturally instead of inventing content", () => {
    const briefing = generateBriefing(emptyInput());
    expect(briefing.summary).toBe("Нямаш записани събития или задачи за днес.");
    expect(briefing.priorities).toEqual([]);
    expect(briefing.calendar).toEqual([]);
    expect(briefing.news).toEqual([]);
    expect(briefing.insight).toBe("Няма достатъчно данни за допълнителен извод.");
  });

  it("handles multiple calendar events and news items without dropping supplied facts", () => {
    const input = createMockBriefingInput("morning", "bg");
    const briefing = generateBriefing(input);
    expect(briefing.calendar.map((item) => item.id).sort()).toEqual(["c1", "c2", "c3"]);
    expect(briefing.news.map((item) => item.id)).toEqual(["n1", "n2", "n3"]);
  });

  it("handles no tasks without claiming completion", () => {
    const input = createMockBriefingInput("evening", "en");
    input.tasks = [];
    const briefing = generateBriefing(input);
    expect(briefing.summary).toBe("No tasks were recorded for today.");
    expect(briefing.completedItems).toEqual([]);
    expect(briefing.unfinishedItems).toEqual([]);
  });

  it("handles missing weather with an explicit unavailable state", () => {
    const input = createMockBriefingInput("morning", "en");
    input.weather = null;
    expect(generateBriefing(input).weather).toEqual({ available: false, summary: "Weather data is unavailable." });
  });

  it("calculates importance from proximity, relevance, importance, and consequences", () => {
    expect(calculateImportance({ dueAt: "2026-10-03T09:00:00+03:00", importance: "high", relevance: 1, consequenceIfMissed: "significant" }, "2026-10-03T08:15:00+03:00")).toBe("critical");
    expect(calculateImportance({ dueAt: "2026-11-03T09:00:00+02:00", importance: "low", relevance: 0.1 }, "2026-10-03T08:15:00+03:00")).toBe("low");
  });

  it("reuses the same period and separates morning, evening, and language cache entries", () => {
    const morningBg = createMockBriefingInput("morning", "bg");
    const first = generateCachedBriefing(morningBg);
    const repeated = generateCachedBriefing({ ...morningBg, currentDateTime: "2026-10-03T09:00:00+03:00" });
    const evening = generateCachedBriefing(createMockBriefingInput("evening", "bg"));
    const english = generateCachedBriefing(createMockBriefingInput("morning", "en"));
    expect(repeated).toBe(first);
    expect(evening).not.toBe(first);
    expect(english).not.toBe(first);
  });
});