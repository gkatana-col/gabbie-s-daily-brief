import { describe, expect, it } from "vitest";
import { applyNativeCalendar } from "./useBriefing";
import { createMockBriefingInput } from "./mockData";

const nativeItems = [
  { id: "n1", title: "Лекция по Green Transition", start: "2026-10-04T09:00:00+03:00", end: "2026-10-04T10:30:00+03:00", importance: "high" as const },
];

describe("applyNativeCalendar", () => {
  it("replaces mock events with real device events when native access is granted", () => {
    const input = createMockBriefingInput("morning", "bg");
    const result = applyNativeCalendar(input, { status: "ok", items: nativeItems });
    expect(result.calendarEvents).toHaveLength(1);
    expect(result.calendarEvents[0]?.title).toBe("Лекция по Green Transition");
  });

  it("keeps existing events when permission is denied", () => {
    const input = createMockBriefingInput("morning", "bg");
    const result = applyNativeCalendar(input, { status: "permission_denied", items: [] });
    expect(result.calendarEvents).toEqual(input.calendarEvents);
  });

  it("keeps existing events when the device calendar is empty", () => {
    const input = createMockBriefingInput("morning", "bg");
    const result = applyNativeCalendar(input, { status: "ok", items: [] });
    expect(result.calendarEvents).toEqual(input.calendarEvents);
  });

  it("keeps existing events in the browser (web status)", () => {
    const input = createMockBriefingInput("morning", "bg");
    const result = applyNativeCalendar(input, { status: "web", items: [] });
    expect(result.calendarEvents).toEqual(input.calendarEvents);
  });
});
