import { afterEach, describe, expect, it } from "vitest";
import { generateBriefing } from "@/features/briefing/briefingEngine";
import { createMockBriefingInput, mockUser } from "@/features/briefing/mockData";
import { resolveBriefingPeriod } from "@/features/briefing/briefingScheduler";
import { nativeBridge, resetNativeBridge, setNativeBridge, webNativeBridge } from "@/features/native/nativeBridge";
import { getPlatformCapabilities } from "@/features/native/platformCapabilities";
import { briefingToNowBarContent } from "@/features/native/nowBarMapping";
import { mockNativeCalendarProvider, unavailableHealthDataProvider, unsupportedNotificationProvider, WebNowBarAdapter } from "@/features/native/providers";

const brief = (type: "morning" | "evening", lang: "bg" | "en" = "bg") => generateBriefing(createMockBriefingInput(type, lang, mockUser));

describe("native abstraction (web)", () => {
  afterEach(() => resetNativeBridge());

  it("detects the web platform with every native capability off", () => {
    expect(nativeBridge.isNativeApp()).toBe(false);
    expect(nativeBridge.getPlatform()).toBe("web");
    expect(getPlatformCapabilities()).toEqual({ isNativeApp: false, platform: "web", supportsNowBar: false, supportsNativeNotifications: false, supportsNativeCalendar: false, supportsHealthData: false, supportsHomeWidget: false });
  });

  it("falls back safely without throwing", async () => {
    await expect(nativeBridge.requestPermission("calendar")).resolves.toBe(false);
    await expect(nativeBridge.sendNowBarUpdate({ id: "x", type: "general", title: "Brief" })).resolves.toBeUndefined();
    await expect(nativeBridge.openNativeScreen("calendar")).resolves.toBeUndefined();
    expect(nativeBridge.getDeviceTimezone()).toBeTruthy();
    setNativeBridge({ ...webNativeBridge, requestPermission: () => Promise.reject(new Error("boom")) });
    await expect(nativeBridge.requestPermission("x")).resolves.toBe(false);
  });

  it("Now Bar adapter, notifications and health are unsupported no-ops", async () => {
    const adapter = new WebNowBarAdapter();
    expect(adapter.isSupported()).toBe(false);
    await adapter.update({ id: "a", type: "morning", title: "Добро утро" });
    expect(adapter.lastContent?.id).toBe("a");
    await adapter.clear();
    expect(adapter.lastContent).toBeNull();
    expect(unsupportedNotificationProvider.isSupported()).toBe(false);
    await expect(unsupportedNotificationProvider.showNotification({ id: "n", title: "x" })).resolves.toBe(false);
    await expect(unavailableHealthDataProvider.getSteps("2026-10-03")).resolves.toEqual({ available: false, reason: "native_health_unavailable" });
  });

  it("calendar provider keeps using the existing mock data", async () => {
    expect((await mockNativeCalendarProvider.getTodayEvents()).map((e) => e.title)).toEqual(["Екипна среща", "Университет", "Вечеря с Мила"]);
  });

  it("maps morning, evening and next-event briefing states", () => {
    const morning = briefingToNowBarContent(brief("morning"), "morning", "bg", new Date("2026-10-03T08:15:00+03:00"));
    expect(morning.type).toBe("morning");
    expect(morning.title).toBe("Добро утро");
    expect(morning.subtitle).toBe("Твоят ден · 3 важни неща днес");
    const evening = briefingToNowBarContent(brief("evening"), "evening", "bg", new Date("2026-10-03T20:45:00+03:00"));
    expect([evening.title, evening.subtitle]).toEqual(["Вечерен обзор", "Как мина денят?"]);
    const soon = briefingToNowBarContent(brief("morning"), "morning", "bg", new Date("2026-10-03T13:30:00+03:00"));
    expect([soon.type, soon.subtitle]).toEqual(["calendar", "Университет · След 30 мин"]);
    expect(briefingToNowBarContent(brief("morning", "en"), "morning", "en", new Date("2026-10-03T08:15:00+03:00")).title).toBe("Good morning");
  });

  it("scheduler resolves periods by local hour", () => {
    expect(resolveBriefingPeriod(new Date(2026, 9, 3, 8))).toBe("morning");
    expect(resolveBriefingPeriod(new Date(2026, 9, 3, 20))).toBe("evening");
    expect(resolveBriefingPeriod(new Date(2026, 9, 3, 2))).toBe("inactive");
  });
});
