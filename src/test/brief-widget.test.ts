import { describe, expect, it } from "vitest";
import { generateBriefing } from "@/features/briefing/briefingEngine";
import { createMockBriefingInput } from "@/features/briefing/mockData";
import { briefingWidgetDataProvider, resolveBriefWidgetMode } from "@/features/widget/BriefWidgetDataProvider";

describe("BriefWidgetDataProvider", () => {
  it("creates a factual Bulgarian morning widget from briefing data", () => {
    const briefing = generateBriefing(createMockBriefingInput("morning", "bg"));
    const data = briefingWidgetDataProvider.getData("morning", briefing, "bg");
    expect(data.title).toBe("Добро утро");
    expect(data.summary).toBe("3 важни неща днес");
    expect(data.primaryItem?.text).toBe("14:00 · Университет");
    expect(data.secondaryItem?.text).toBe("21°C · Предимно слънчево");
  });

  it("creates a factual English evening widget", () => {
    const briefing = generateBriefing(createMockBriefingInput("evening", "en"));
    const data = briefingWidgetDataProvider.getData("evening", briefing, "en");
    expect(data.title).toBe("Evening recap");
    expect(data.primaryItem?.text).toBe("1 task completed");
    expect(data.secondaryItem?.text).toBe("1 event tomorrow");
  });

  it("creates a neutral inactive widget without claiming access to updates", () => {
    const briefing = generateBriefing(createMockBriefingInput("morning", "bg"));
    const data = briefingWidgetDataProvider.getData("inactive", briefing, "bg");
    expect(data).toMatchObject({ mode: "inactive", title: "Brief", summary: "Твоят ден, накратко", primaryItem: null, secondaryItem: null });
  });

  it("schedules morning, evening, and inactive periods", () => {
    expect(resolveBriefWidgetMode(new Date(2026, 9, 3, 8))).toBe("morning");
    expect(resolveBriefWidgetMode(new Date(2026, 9, 3, 20))).toBe("evening");
    expect(resolveBriefWidgetMode(new Date(2026, 9, 3, 2))).toBe("inactive");
  });
});