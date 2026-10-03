import { describe, expect, it } from "vitest";
import { generateBriefing } from "@/features/briefing/briefingEngine";
import { mockRawBriefingData, mockUser } from "@/features/briefing/mockData";

describe("briefingEngine", () => {
  it("produces a complete Bulgarian briefing", () => {
    const briefing = generateBriefing(mockRawBriefingData, mockUser, "bg");
    expect(briefing.greeting).toBe("Добър ден, Gabbie");
    expect(briefing.priorities).toHaveLength(3);
    expect(briefing.calendarItems).toHaveLength(3);
    expect(briefing.news).toHaveLength(3);
  });

  it("produces natural English briefing content", () => {
    const briefing = generateBriefing(mockRawBriefingData, mockUser, "en");
    expect(briefing.greeting).toBe("Good afternoon, Gabbie");
    expect(briefing.summary).toContain("focused work");
    expect(briefing.weather.condition).toBe("Mostly sunny");
  });
});